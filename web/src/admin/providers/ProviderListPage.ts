import "@goauthentik/web/admin/providers/ProviderWizard";
import "@goauthentik/web/admin/providers/ldap/LDAPProviderForm";
import "@goauthentik/web/admin/providers/oauth2/OAuth2ProviderForm";
import "@goauthentik/web/admin/providers/proxy/ProxyProviderForm";
import "@goauthentik/web/admin/providers/saml/SAMLProviderForm";
import { DEFAULT_CONFIG } from "@goauthentik/web/common/api/config";
import { uiConfig } from "@goauthentik/web/common/ui/config";
import "@goauthentik/web/elements/buttons/SpinnerButton";
import "@goauthentik/web/elements/forms/DeleteBulkForm";
import "@goauthentik/web/elements/forms/ModalForm";
import "@goauthentik/web/elements/forms/ProxyForm";
import { PaginatedResponse } from "@goauthentik/web/elements/table/Table";
import { TableColumn } from "@goauthentik/web/elements/table/Table";
import { TablePage } from "@goauthentik/web/elements/table/TablePage";

import { t } from "@lingui/macro";

import { TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Provider, ProvidersApi } from "@goauthentik/api";

@customElement("ak-provider-list")
export class ProviderListPage extends TablePage<Provider> {
    searchEnabled(): boolean {
        return true;
    }
    pageTitle(): string {
        return t`Providers`;
    }
    pageDescription(): string {
        return t`Provide support for protocols like SAML and OAuth to assigned applications.`;
    }
    pageIcon(): string {
        return "pf-icon pf-icon-integration";
    }

    checkbox = true;

    @property()
    order = "name";

    async apiEndpoint(page: number): Promise<PaginatedResponse<Provider>> {
        return new ProvidersApi(DEFAULT_CONFIG).providersAllList({
            ordering: this.order,
            page: page,
            pageSize: (await uiConfig()).pagination.perPage,
            search: this.search || "",
        });
    }

    columns(): TableColumn[] {
        return [
            new TableColumn(t`Name`, "name"),
            new TableColumn(t`Application`),
            new TableColumn(t`Type`),
            new TableColumn(t`Actions`),
        ];
    }

    renderToolbarSelected(): TemplateResult {
        const disabled = this.selectedElements.length < 1;
        return html`<ak-forms-delete-bulk
            objectLabel=${t`Provider(s)`}
            .objects=${this.selectedElements}
            .usedBy=${(item: Provider) => {
                return new ProvidersApi(DEFAULT_CONFIG).providersAllUsedByList({
                    id: item.pk,
                });
            }}
            .delete=${(item: Provider) => {
                return new ProvidersApi(DEFAULT_CONFIG).providersAllDestroy({
                    id: item.pk,
                });
            }}
        >
            <button ?disabled=${disabled} slot="trigger" class="pf-c-button pf-m-danger">
                ${t`Delete`}
            </button>
        </ak-forms-delete-bulk>`;
    }

    row(item: Provider): TemplateResult[] {
        return [
            html`<a href="#/core/providers/${item.pk}"> ${item.name} </a>`,
            item.assignedApplicationName
                ? html`<i class="pf-icon pf-icon-ok pf-m-success"></i>
                      ${t`Assigned to application `}
                      <a href="#/core/applications/${item.assignedApplicationSlug}"
                          >${item.assignedApplicationName}</a
                      >`
                : html`<i class="pf-icon pf-icon-warning-triangle pf-m-warning"></i>
                      ${t`Warning: Provider not assigned to any application.`}`,
            html`${item.verboseName}`,
            html`<ak-forms-modal>
                <span slot="submit"> ${t`Update`} </span>
                <span slot="header"> ${t`Update ${item.verboseName}`} </span>
                <ak-proxy-form
                    slot="form"
                    .args=${{
                        instancePk: item.pk,
                    }}
                    type=${item.component}
                >
                </ak-proxy-form>
                <button slot="trigger" class="pf-c-button pf-m-plain">
                    <i class="fas fa-edit"></i>
                </button>
            </ak-forms-modal>`,
        ];
    }

    renderObjectCreate(): TemplateResult {
        return html`<ak-provider-wizard> </ak-provider-wizard> `;
    }
}