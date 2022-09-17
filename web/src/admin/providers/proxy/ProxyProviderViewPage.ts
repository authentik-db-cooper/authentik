import MDCaddyStandalone from "@goauthentik/docs/providers/proxy/_caddy_standalone.md";
import MDNginxIngress from "@goauthentik/docs/providers/proxy/_nginx_ingress.md";
import MDNginxPM from "@goauthentik/docs/providers/proxy/_nginx_proxy_manager.md";
import MDNginxStandalone from "@goauthentik/docs/providers/proxy/_nginx_standalone.md";
import MDTraefikCompose from "@goauthentik/docs/providers/proxy/_traefik_compose.md";
import MDTraefikIngress from "@goauthentik/docs/providers/proxy/_traefik_ingress.md";
import MDTraefikStandalone from "@goauthentik/docs/providers/proxy/_traefik_standalone.md";
import "@goauthentik/web/admin/providers/RelatedApplicationButton";
import "@goauthentik/web/admin/providers/proxy/ProxyProviderForm";
import { DEFAULT_CONFIG } from "@goauthentik/web/common/api/config";
import { EVENT_REFRESH } from "@goauthentik/web/common/constants";
import { convertToSlug } from "@goauthentik/web/common/utils";
import { AKElement } from "@goauthentik/web/elements/Base";
import "@goauthentik/web/elements/CodeMirror";
import { PFColor } from "@goauthentik/web/elements/Label";
import { MarkdownDocument } from "@goauthentik/web/elements/Markdown";
import "@goauthentik/web/elements/Markdown";
import "@goauthentik/web/elements/Tabs";
import "@goauthentik/web/elements/buttons/ModalButton";
import "@goauthentik/web/elements/buttons/SpinnerButton";
import "@goauthentik/web/elements/events/ObjectChangelog";

import { t } from "@lingui/macro";

import { CSSResult, TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import AKGlobal from "@goauthentik/web/common/styles/authentik.css";
import PFBanner from "@patternfly/patternfly/components/Banner/banner.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFCard from "@patternfly/patternfly/components/Card/card.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";
import PFDescriptionList from "@patternfly/patternfly/components/DescriptionList/description-list.css";
import PFForm from "@patternfly/patternfly/components/Form/form.css";
import PFFormControl from "@patternfly/patternfly/components/FormControl/form-control.css";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFGrid from "@patternfly/patternfly/layouts/Grid/grid.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

import { ProvidersApi, ProxyMode, ProxyProvider } from "@goauthentik/api";

export function ModeToLabel(action?: ProxyMode): string {
    if (!action) return "";
    switch (action) {
        case ProxyMode.Proxy:
            return t`Proxy`;
        case ProxyMode.ForwardSingle:
            return t`Forward auth (single application)`;
        case ProxyMode.ForwardDomain:
            return t`Forward auth (domain-level)`;
    }
}

export function isForward(mode: ProxyMode): boolean {
    switch (mode) {
        case ProxyMode.Proxy:
            return false;
        case ProxyMode.ForwardSingle:
        case ProxyMode.ForwardDomain:
            return true;
    }
}

@customElement("ak-provider-proxy-view")
export class ProxyProviderViewPage extends AKElement {
    @property()
    set args(value: { [key: string]: number }) {
        this.providerID = value.id;
    }

    @property({ type: Number })
    set providerID(value: number) {
        new ProvidersApi(DEFAULT_CONFIG)
            .providersProxyRetrieve({
                id: value,
            })
            .then((prov) => (this.provider = prov));
    }

    @property({ attribute: false })
    provider?: ProxyProvider;

    static get styles(): CSSResult[] {
        return [
            PFBase,
            PFButton,
            PFPage,
            PFGrid,
            PFContent,
            PFForm,
            PFFormControl,
            PFCard,
            PFDescriptionList,
            PFBanner,
            AKGlobal,
        ];
    }

    constructor() {
        super();
        this.addEventListener(EVENT_REFRESH, () => {
            if (!this.provider?.pk) return;
            this.providerID = this.provider?.pk;
        });
    }

    renderConfigTemplate(markdown: MarkdownDocument): MarkdownDocument {
        const extHost = new URL(this.provider?.externalHost || "http://a");
        // See website/docs/providers/proxy/forward_auth.mdx
        if (this.provider?.mode === ProxyMode.ForwardSingle) {
            markdown.html = markdown.html
                .replaceAll("authentik.company", window.location.hostname)
                .replaceAll("outpost.company:9000", window.location.hostname)
                .replaceAll("https://app.company", extHost.toString())
                .replaceAll("app.company", extHost.hostname);
        } else if (this.provider?.mode == ProxyMode.ForwardDomain) {
            markdown.html = markdown.html
                .replaceAll("authentik.company", window.location.hostname)
                .replaceAll("outpost.company:9000", extHost.toString())
                .replaceAll("https://app.company", extHost.toString())
                .replaceAll("app.company", extHost.hostname);
        }
        return markdown;
    }

    renderConfig(): TemplateResult {
        const serves = [
            {
                label: t`Nginx (Ingress)`,
                md: MDNginxIngress,
            },
            {
                label: t`Nginx (Proxy Manager)`,
                md: MDNginxPM,
            },
            {
                label: t`Nginx (standalone)`,
                md: MDNginxStandalone,
            },
            {
                label: t`Traefik (Ingress)`,
                md: MDTraefikIngress,
            },
            {
                label: t`Traefik (Compose)`,
                md: MDTraefikCompose,
            },
            {
                label: t`Traefik (Standalone)`,
                md: MDTraefikStandalone,
            },
            {
                label: t`Caddy (Standalone)`,
                md: MDCaddyStandalone,
            },
        ];
        return html`<ak-tabs pageIdentifier="proxy-setup">
            ${serves.map((server) => {
                return html`<section
                    slot="page-${convertToSlug(server.label)}"
                    data-tab-title="${server.label}"
                    class="pf-c-page__main-section pf-m-light pf-m-no-padding-mobile"
                >
                    <ak-markdown .md=${this.renderConfigTemplate(server.md)}></ak-markdown>
                </section>`;
            })}</ak-tabs
        >`;
    }

    render(): TemplateResult {
        if (!this.provider) {
            return html``;
        }
        return html`${this.provider?.assignedApplicationName
                ? html``
                : html`<div slot="header" class="pf-c-banner pf-m-warning">
                      ${t`Warning: Provider is not used by an Application.`}
                  </div>`}
            ${this.provider?.outpostSet.length < 1
                ? html`<div slot="header" class="pf-c-banner pf-m-warning">
                      ${t`Warning: Provider is not used by any Outpost.`}
                  </div>`
                : html``}
            <div class="pf-c-page__main-section pf-m-no-padding-mobile pf-l-grid pf-m-gutter">
                <div class="pf-c-card pf-l-grid__item pf-m-12-col">
                    <div class="pf-c-card__body">
                        <dl class="pf-c-description-list pf-m-3-col-on-lg">
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text">${t`Name`}</span>
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        ${this.provider.name}
                                    </div>
                                </dd>
                            </div>
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text"
                                        >${t`Assigned to application`}</span
                                    >
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        <ak-provider-related-application
                                            .provider=${this.provider}
                                        ></ak-provider-related-application>
                                    </div>
                                </dd>
                            </div>
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text"
                                        >${t`Internal Host`}</span
                                    >
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        ${this.provider.internalHost}
                                    </div>
                                </dd>
                            </div>
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text"
                                        >${t`External Host`}</span
                                    >
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        <a target="_blank" href="${this.provider.externalHost}"
                                            >${this.provider.externalHost}</a
                                        >
                                    </div>
                                </dd>
                            </div>
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text"
                                        >${t`Basic-Auth`}</span
                                    >
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        <ak-label
                                            color=${this.provider.basicAuthEnabled
                                                ? PFColor.Green
                                                : PFColor.Grey}
                                        >
                                            ${this.provider.basicAuthEnabled ? t`Yes` : t`No`}
                                        </ak-label>
                                    </div>
                                </dd>
                            </div>
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text">${t`Mode`}</span>
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        ${ModeToLabel(this.provider.mode || ProxyMode.Proxy)}
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div class="pf-c-card__footer">
                        <ak-forms-modal>
                            <span slot="submit"> ${t`Update`} </span>
                            <span slot="header"> ${t`Update Proxy Provider`} </span>
                            <ak-provider-proxy-form
                                slot="form"
                                .instancePk=${this.provider.pk || 0}
                            >
                            </ak-provider-proxy-form>
                            <button slot="trigger" class="pf-c-button pf-m-primary">
                                ${t`Edit`}
                            </button>
                        </ak-forms-modal>
                    </div>
                </div>
                <div class="pf-c-card pf-l-grid__item pf-m-12-col">
                    <div class="pf-c-card__title">${t`Protocol Settings`}</div>
                    <div class="pf-c-card__body">
                        <form class="pf-c-form">
                            <div class="pf-c-form__group">
                                <label class="pf-c-form__label">
                                    <span class="pf-c-form__label-text"
                                        >${t`Allowed Redirect URIs`}</span
                                    >
                                </label>
                                <input
                                    class="pf-c-form-control"
                                    readonly
                                    type="text"
                                    value=${this.provider.redirectUris}
                                />
                            </div>
                        </form>
                    </div>
                </div>
                <div class="pf-c-card pf-l-grid__item pf-m-12-col">
                    <div class="pf-c-card__title">${t`Setup`}</div>
                    <div class="pf-c-card__body">
                        ${isForward(this.provider?.mode || ProxyMode.Proxy)
                            ? html` ${this.renderConfig()} `
                            : html` <p>${t`No additional setup is required.`}</p> `}
                    </div>
                </div>
            </div>`;
    }
}