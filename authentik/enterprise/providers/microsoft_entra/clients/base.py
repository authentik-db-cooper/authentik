from asyncio import run
from collections.abc import Coroutine
from dataclasses import asdict
from typing import Any

import httpx
from azure.core.exceptions import (
    ClientAuthenticationError,
    ServiceRequestError,
    ServiceResponseError,
)
from azure.identity.aio import ClientSecretCredential
from django.db.models import Model
from django.http import HttpResponseBadRequest, HttpResponseNotFound
from kiota_abstractions.api_error import APIError
from kiota_abstractions.request_information import RequestInformation
from kiota_authentication_azure.azure_identity_authentication_provider import (
    AzureIdentityAuthenticationProvider,
)
from kiota_http.kiota_client_factory import KiotaClientFactory
from msgraph.generated.models.entity import Entity
from msgraph.generated.models.o_data_errors.o_data_error import ODataError
from msgraph.graph_request_adapter import GraphRequestAdapter, options
from msgraph.graph_service_client import GraphServiceClient
from msgraph_core import GraphClientFactory
from opentelemetry import trace

from authentik.enterprise.providers.microsoft_entra.models import MicrosoftEntraProvider
from authentik.events.utils import sanitize_item
from authentik.lib.sync.outgoing import HTTP_CONFLICT
from authentik.lib.sync.outgoing.base import SAFE_METHODS, BaseOutgoingSyncClient
from authentik.lib.sync.outgoing.exceptions import (
    BadRequestSyncException,
    DryRunRejected,
    NotFoundSyncException,
    ObjectExistsSyncException,
    StopSync,
    TransientSyncException,
)


class AuthentikRequestAdapter(GraphRequestAdapter):
    def __init__(self, auth_provider, provider: MicrosoftEntraProvider, client=None):
        super().__init__(auth_provider, client)
        self._provider = provider

    async def get_http_response_message(
        self,
        request_info: RequestInformation,
        parent_span: trace.Span,
        claims: str = "",
    ) -> httpx.Response:
        if self._provider.dry_run and request_info.http_method.value.upper() not in SAFE_METHODS:
            raise DryRunRejected(
                url=request_info.url,
                method=request_info.http_method.value,
                body=request_info.content.decode("utf-8"),
            )
        return await super().get_http_response_message(request_info, parent_span, claims=claims)


class MicrosoftEntraSyncClient[TModel: Model, TConnection: Model, TSchema: dict](
    BaseOutgoingSyncClient[TModel, TConnection, TSchema, MicrosoftEntraProvider]
):
    """Base client for syncing to microsoft entra"""

    domains: list

    def __init__(self, provider: MicrosoftEntraProvider) -> None:
        super().__init__(provider)
        self.credentials = provider.microsoft_credentials()
        self.__prefetch_domains()

    def get_request_adapter(
        self, credentials: ClientSecretCredential, scopes: list[str] | None = None
    ) -> AuthentikRequestAdapter:
        if scopes:
            auth_provider = AzureIdentityAuthenticationProvider(
                credentials=credentials, scopes=scopes
            )
        else:
            auth_provider = AzureIdentityAuthenticationProvider(credentials=credentials)

        return AuthentikRequestAdapter(
            auth_provider=auth_provider,
            provider=self.provider,
            client=GraphClientFactory.create_with_default_middleware(
                options=options, client=KiotaClientFactory.get_default_client()
            ),
        )

    @property
    def client(self):
        return GraphServiceClient(request_adapter=self.get_request_adapter(**self.credentials))

    def _request[T](self, request: Coroutine[Any, Any, T]) -> T:
        try:
            return run(request)
        except ClientAuthenticationError as exc:
            raise StopSync(exc, None, None) from exc
        except ODataError as exc:
            raise StopSync(exc, None, None) from exc
        except (ServiceRequestError, ServiceResponseError) as exc:
            raise TransientSyncException("Failed to sent request") from exc
        except APIError as exc:
            if exc.response_status_code == HttpResponseNotFound.status_code:
                raise NotFoundSyncException("Object not found") from exc
            if exc.response_status_code == HttpResponseBadRequest.status_code:
                raise BadRequestSyncException("Bad request", exc.response_headers) from exc
            if exc.response_status_code == HTTP_CONFLICT:
                raise ObjectExistsSyncException("Object exists", exc.response_headers) from exc
            raise exc

    def __prefetch_domains(self):
        self.domains = []
        organizations = self._request(self.client.organization.get())
        next_link = True
        while next_link:
            for org in organizations.value:
                self.domains.extend([x.name for x in org.verified_domains])
            next_link = organizations.odata_next_link
            if not next_link:
                break
            organizations = self._request(self.client.organization.with_url(next_link).get())

    def check_email_valid(self, *emails: str):
        for email in emails:
            if not any(email.endswith(f"@{domain_name}") for domain_name in self.domains):
                raise BadRequestSyncException(f"Invalid email domain: {email}")

    def entity_as_dict(self, entity: Entity) -> dict:
        """Create a dictionary of a model instance, making sure to remove (known) things
        we can't JSON serialize"""
        raw_data = asdict(entity)
        raw_data.pop("backing_store", None)
        return sanitize_item(raw_data)
