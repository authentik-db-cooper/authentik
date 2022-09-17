import "@goauthentik/web/admin/admin-overview/AdminOverviewPage";
import { ID_REGEX, Route, SLUG_REGEX, UUID_REGEX } from "@goauthentik/web/elements/router/Route";

import { html } from "lit";

export const ROUTES: Route[] = [
    // Prevent infinite Shell loops
    new Route(new RegExp("^/$")).redirect("/administration/overview"),
    new Route(new RegExp("^#.*")).redirect("/administration/overview"),
    new Route(new RegExp("^/library$")).redirect("/if/user/", true),
    // statically imported since this is the default route
    new Route(new RegExp("^/administration/overview$"), async () => {
        return html`<ak-admin-overview></ak-admin-overview>`;
    }),
    new Route(new RegExp("^/administration/dashboard/users$"), async () => {
        await import("@goauthentik/web/admin/admin-overview/DashboardUserPage");
        return html`<ak-admin-dashboard-users></ak-admin-dashboard-users>`;
    }),
    new Route(new RegExp("^/administration/system-tasks$"), async () => {
        await import("@goauthentik/web/admin/system-tasks/SystemTaskListPage");
        return html`<ak-system-task-list></ak-system-task-list>`;
    }),
    new Route(new RegExp("^/core/providers$"), async () => {
        await import("@goauthentik/web/admin/providers/ProviderListPage");
        return html`<ak-provider-list></ak-provider-list>`;
    }),
    new Route(new RegExp(`^/core/providers/(?<id>${ID_REGEX})$`), async (args) => {
        await import("@goauthentik/web/admin/providers/ProviderViewPage");
        return html`<ak-provider-view .providerID=${parseInt(args.id, 10)}></ak-provider-view>`;
    }),
    new Route(new RegExp("^/core/applications$"), async () => {
        await import("@goauthentik/web/admin/applications/ApplicationListPage");
        return html`<ak-application-list></ak-application-list>`;
    }),
    new Route(new RegExp(`^/core/applications/(?<slug>${SLUG_REGEX})$`), async (args) => {
        await import("@goauthentik/web/admin/applications/ApplicationViewPage");
        return html`<ak-application-view .applicationSlug=${args.slug}></ak-application-view>`;
    }),
    new Route(new RegExp("^/core/sources$"), async () => {
        await import("@goauthentik/web/admin/sources/SourceListPage");
        return html`<ak-source-list></ak-source-list>`;
    }),
    new Route(new RegExp(`^/core/sources/(?<slug>${SLUG_REGEX})$`), async (args) => {
        await import("@goauthentik/web/admin/sources/SourceViewPage");
        return html`<ak-source-view .sourceSlug=${args.slug}></ak-source-view>`;
    }),
    new Route(new RegExp("^/core/property-mappings$"), async () => {
        await import("@goauthentik/web/admin/property-mappings/PropertyMappingListPage");
        return html`<ak-property-mapping-list></ak-property-mapping-list>`;
    }),
    new Route(new RegExp("^/core/tokens$"), async () => {
        await import("@goauthentik/web/admin/tokens/TokenListPage");
        return html`<ak-token-list></ak-token-list>`;
    }),
    new Route(new RegExp("^/core/tenants$"), async () => {
        await import("@goauthentik/web/admin/tenants/TenantListPage");
        return html`<ak-tenant-list></ak-tenant-list>`;
    }),
    new Route(new RegExp("^/policy/policies$"), async () => {
        await import("@goauthentik/web/admin/policies/PolicyListPage");
        return html`<ak-policy-list></ak-policy-list>`;
    }),
    new Route(new RegExp("^/policy/reputation$"), async () => {
        await import("@goauthentik/web/admin/policies/reputation/ReputationListPage");
        return html`<ak-policy-reputation-list></ak-policy-reputation-list>`;
    }),
    new Route(new RegExp("^/identity/groups$"), async () => {
        await import("@goauthentik/web/admin/groups/GroupListPage");
        return html`<ak-group-list></ak-group-list>`;
    }),
    new Route(new RegExp(`^/identity/groups/(?<uuid>${UUID_REGEX})$`), async (args) => {
        await import("@goauthentik/web/admin/groups/GroupViewPage");
        return html`<ak-group-view .groupId=${args.uuid}></ak-group-view>`;
    }),
    new Route(new RegExp("^/identity/users$"), async () => {
        await import("@goauthentik/web/admin/users/UserListPage");
        return html`<ak-user-list></ak-user-list>`;
    }),
    new Route(new RegExp(`^/identity/users/(?<id>${ID_REGEX})$`), async (args) => {
        await import("@goauthentik/web/admin/users/UserViewPage");
        return html`<ak-user-view .userId=${parseInt(args.id, 10)}></ak-user-view>`;
    }),
    new Route(new RegExp("^/flow/stages/invitations$"), async () => {
        await import("@goauthentik/web/admin/stages/invitation/InvitationListPage");
        return html`<ak-stage-invitation-list></ak-stage-invitation-list>`;
    }),
    new Route(new RegExp("^/flow/stages/prompts$"), async () => {
        await import("@goauthentik/web/admin/stages/prompt/PromptListPage");
        return html`<ak-stage-prompt-list></ak-stage-prompt-list>`;
    }),
    new Route(new RegExp("^/flow/stages$"), async () => {
        await import("@goauthentik/web/admin/stages/StageListPage");
        return html`<ak-stage-list></ak-stage-list>`;
    }),
    new Route(new RegExp("^/flow/flows$"), async () => {
        await import("@goauthentik/web/admin/flows/FlowListPage");
        return html`<ak-flow-list></ak-flow-list>`;
    }),
    new Route(new RegExp(`^/flow/flows/(?<slug>${SLUG_REGEX})$`), async (args) => {
        await import("@goauthentik/web/admin/flows/FlowViewPage");
        return html`<ak-flow-view .flowSlug=${args.slug}></ak-flow-view>`;
    }),
    new Route(new RegExp("^/events/log$"), async () => {
        await import("@goauthentik/web/admin/events/EventListPage");
        return html`<ak-event-list></ak-event-list>`;
    }),
    new Route(new RegExp(`^/events/log/(?<id>${UUID_REGEX})$`), async (args) => {
        await import("@goauthentik/web/admin/events/EventInfoPage");
        return html`<ak-event-info-page .eventID=${args.id}></ak-event-info-page>`;
    }),
    new Route(new RegExp("^/events/transports$"), async () => {
        await import("@goauthentik/web/admin/events/TransportListPage");
        return html`<ak-event-transport-list></ak-event-transport-list>`;
    }),
    new Route(new RegExp("^/events/rules$"), async () => {
        await import("@goauthentik/web/admin/events/RuleListPage");
        return html`<ak-event-rule-list></ak-event-rule-list>`;
    }),
    new Route(new RegExp("^/outpost/outposts$"), async () => {
        await import("@goauthentik/web/admin/outposts/OutpostListPage");
        return html`<ak-outpost-list></ak-outpost-list>`;
    }),
    new Route(new RegExp("^/outpost/integrations$"), async () => {
        await import("@goauthentik/web/admin/outposts/ServiceConnectionListPage");
        return html`<ak-outpost-service-connection-list></ak-outpost-service-connection-list>`;
    }),
    new Route(new RegExp("^/crypto/certificates$"), async () => {
        await import("@goauthentik/web/admin/crypto/CertificateKeyPairListPage");
        return html`<ak-crypto-certificate-list></ak-crypto-certificate-list>`;
    }),
    new Route(new RegExp("^/blueprints/instances$"), async () => {
        await import("@goauthentik/web/admin/blueprints/BlueprintListPage");
        return html`<ak-blueprint-list></ak-blueprint-list>`;
    }),
];