import { DEFAULT_CONFIG } from "@goauthentik/web/common/api/config";
import { first } from "@goauthentik/web/common/utils";
import "@goauthentik/web/elements/forms/FormGroup";
import "@goauthentik/web/elements/forms/HorizontalFormElement";
import { ModelForm } from "@goauthentik/web/elements/forms/ModelForm";

import { t } from "@lingui/macro";

import { TemplateResult, html } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { until } from "lit/directives/until.js";

import {
    BackendsEnum,
    FlowsApi,
    FlowsInstancesListDesignationEnum,
    PasswordStage,
    StagesApi,
} from "@goauthentik/api";

@customElement("ak-stage-password-form")
export class PasswordStageForm extends ModelForm<PasswordStage, string> {
    loadInstance(pk: string): Promise<PasswordStage> {
        return new StagesApi(DEFAULT_CONFIG).stagesPasswordRetrieve({
            stageUuid: pk,
        });
    }

    getSuccessMessage(): string {
        if (this.instance) {
            return t`Successfully updated stage.`;
        } else {
            return t`Successfully created stage.`;
        }
    }

    send = (data: PasswordStage): Promise<PasswordStage> => {
        if (this.instance) {
            return new StagesApi(DEFAULT_CONFIG).stagesPasswordUpdate({
                stageUuid: this.instance.pk || "",
                passwordStageRequest: data,
            });
        } else {
            return new StagesApi(DEFAULT_CONFIG).stagesPasswordCreate({
                passwordStageRequest: data,
            });
        }
    };

    isBackendSelected(field: BackendsEnum): boolean {
        if (!this.instance) {
            return true;
        }
        return (
            this.instance.backends.filter((isField) => {
                return field === isField;
            }).length > 0
        );
    }

    renderForm(): TemplateResult {
        return html`<form class="pf-c-form pf-m-horizontal">
            <div class="form-help-text">
                ${t`Validate the user's password against the selected backend(s).`}
            </div>
            <ak-form-element-horizontal label=${t`Name`} ?required=${true} name="name">
                <input
                    type="text"
                    value="${ifDefined(this.instance?.name || "")}"
                    class="pf-c-form-control"
                    required
                />
            </ak-form-element-horizontal>
            <ak-form-group .expanded=${true}>
                <span slot="header"> ${t`Stage-specific settings`} </span>
                <div slot="body" class="pf-c-form">
                    <ak-form-element-horizontal
                        label=${t`Backends`}
                        ?required=${true}
                        name="backends"
                    >
                        <select name="users" class="pf-c-form-control" multiple>
                            <option
                                value=${BackendsEnum.CoreAuthInbuiltBackend}
                                ?selected=${this.isBackendSelected(
                                    BackendsEnum.CoreAuthInbuiltBackend,
                                )}
                            >
                                ${t`User database + standard password`}
                            </option>
                            <option
                                value=${BackendsEnum.CoreAuthTokenBackend}
                                ?selected=${this.isBackendSelected(
                                    BackendsEnum.CoreAuthTokenBackend,
                                )}
                            >
                                ${t`User database + app passwords`}
                            </option>
                            <option
                                value=${BackendsEnum.SourcesLdapAuthLdapBackend}
                                ?selected=${this.isBackendSelected(
                                    BackendsEnum.SourcesLdapAuthLdapBackend,
                                )}
                            >
                                ${t`User database + LDAP password`}
                            </option>
                        </select>
                        <p class="pf-c-form__helper-text">
                            ${t`Selection of backends to test the password against.`}
                        </p>
                        <p class="pf-c-form__helper-text">
                            ${t`Hold control/command to select multiple items.`}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Configuration flow`}
                        ?required=${true}
                        name="configureFlow"
                    >
                        <select class="pf-c-form-control">
                            <option
                                value=""
                                ?selected=${this.instance?.configureFlow === undefined}
                            >
                                ---------
                            </option>
                            ${until(
                                new FlowsApi(DEFAULT_CONFIG)
                                    .flowsInstancesList({
                                        ordering: "slug",
                                        designation:
                                            FlowsInstancesListDesignationEnum.StageConfiguration,
                                    })
                                    .then((flows) => {
                                        return flows.results.map((flow) => {
                                            let selected = this.instance?.configureFlow === flow.pk;
                                            if (
                                                !this.instance?.pk &&
                                                !this.instance?.configureFlow &&
                                                flow.slug === "default-password-change"
                                            ) {
                                                selected = true;
                                            }
                                            return html`<option
                                                value=${ifDefined(flow.pk)}
                                                ?selected=${selected}
                                            >
                                                ${flow.name} (${flow.slug})
                                            </option>`;
                                        });
                                    }),
                                html`<option>${t`Loading...`}</option>`,
                            )}
                        </select>
                        <p class="pf-c-form__helper-text">
                            ${t`Flow used by an authenticated user to configure their password. If empty, user will not be able to configure change their password.`}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${t`Failed attempts before cancel`}
                        ?required=${true}
                        name="failedAttemptsBeforeCancel"
                    >
                        <input
                            type="number"
                            value="${first(this.instance?.failedAttemptsBeforeCancel, 5)}"
                            class="pf-c-form-control"
                            required
                        />
                        <p class="pf-c-form__helper-text">
                            ${t`How many attempts a user has before the flow is canceled. To lock the user out, use a reputation policy and a user_write stage.`}
                        </p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
        </form>`;
    }
}