"use client";

import FormFeedback from "@/components/form-feedback";
import SectionSkeleton from "@/components/section-skeleton";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Field from "@/elements/field";
import Form from "@/elements/form";
import { useWorkspaceEditor } from "@/hooks/use-workspace-editor";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = { tenantId: number | null; onClose: () => void; onDone: () => void };

export default function WorkspaceEditor ({ tenantId, onClose, onDone }: Props) {

    const t = useTranslations("workspaces");
    const data = useWorkspaceEditor(tenantId, onDone);

    return (

        <Dialog
            open={tenantId != null}
            onOpenChange={( open ) => { if ( !open && !data.pending ) onClose(); }}
            title={t("editTitle")}
            description={data.host ?? undefined}
            close={t("close")}
            dismissible={!data.pending}
            footer={(

                <>

                    <Button variant="ghost" disabled={data.pending} onClick={onClose}>{t("close")}</Button>

                    <Button pending={data.pending} onClick={() => { void data.save(); }}><Icon name="check" />{t("save")}</Button>

                </>

            )}
        >

            {data.loading ? <SectionSkeleton /> : (

                <Form pending={data.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void data.save(); }}>

                    <Field
                        id="workspace-name" label={t("name")} maxLength={200} value={data.values.name} error={data.errors.name}
                        disabled={data.pending} onChange={( event ) => data.change({ name: event.target.value })}
                    />

                    <Field
                        id="workspace-email" label={t("email")} optional={t("optional")} type="email" dir="ltr" autoComplete="email"
                        value={data.values.email} error={data.errors.email} disabled={data.pending}
                        onChange={( event ) => data.change({ email: event.target.value })}
                    />

                    <Field
                        id="workspace-phone" label={t("phone")} optional={t("optional")} type="tel" dir="ltr" autoComplete="tel"
                        value={data.values.phone} error={data.errors.phone} disabled={data.pending}
                        onChange={( event ) => data.change({ phone: event.target.value })}
                    />

                    <Field
                        id="workspace-domain" label={t("domain")} optional={t("optional")} hint={t("domainHint")} dir="ltr"
                        value={data.values.domain} error={data.errors.domain} disabled={data.pending}
                        onChange={( event ) => data.change({ domain: event.target.value })}
                    />

                    <FormFeedback id="workspace-edit-failure" error={data.error} />

                </Form>

            )}

        </Dialog>

    );

}
