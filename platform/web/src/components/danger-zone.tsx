"use client";

import ConfirmCode from "@/components/confirm-code";
import FormFeedback from "@/components/form-feedback";
import PasswordField from "@/components/password-field";
import Button from "@/elements/button";
import Check from "@/elements/check";
import Dialog from "@/elements/dialog";
import Emblem from "@/elements/emblem";
import Form from "@/elements/form";
import SettingRow from "@/elements/setting-row";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useAccountClosure } from "@/hooks/use-account-closure";
import Icon from "@/icons/icon";

type Props = { hasPassword: boolean };

const effects = {
    deactivate: ["deactivateSignedOut", "deactivateKept", "deactivateReturn"],
    delete: ["deleteForfeit", "deleteRemoved", "deleteFinal"],
} as const;

export default function DangerZone ({ hasPassword }: Props) {

    const data = useAccountClosure(hasPassword);
    const { t, step, confirmation } = data;

    return (

        <Stack gap={5}>

            <Stack as="ul" gap={0} aria-label={t("dangerTitle")}>

                <SettingRow
                    media={<Emblem tone="amber" look="flat"><Icon name="power" /></Emblem>}
                    title={t("deactivateTitle")}
                    description={t("deactivateDescription")}
                    action={<Button variant="outlined" size="small" onClick={() => data.open("deactivate")}>{t("deactivate")}</Button>}
                />

                <SettingRow
                    tone="danger"
                    media={<Emblem tone="red" look="flat"><Icon name="trash" /></Emblem>}
                    title={t("deleteTitle")}
                    description={t("deleteDescription")}
                    action={<Button variant="danger" size="small" onClick={() => data.open("delete")}>{t("delete")}</Button>}
                />

            </Stack>

            <Dialog
                open={!!step}
                onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t(step === "delete" ? "deleteConfirmTitle" : "deactivateConfirmTitle")}
                close={t("cancel")}
                dismissible={!data.pending}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.pending} onClick={data.close}>{t("cancel")}</Button>

                        <Button
                            variant={step === "delete" ? "danger" : "filled"}
                            pending={data.pending}
                            disabled={!data.ready || (!!confirmation.challenge && !confirmation.code && !hasPassword)}
                            onClick={() => { void data.submit(); }}
                        >

                            {t(!hasPassword && !confirmation.challenge ? "closureSendCode"
                                : step === "delete" ? "deleteConfirm" : "deactivateConfirm")}

                        </Button>

                    </>

                )}
            >

                <Form pending={data.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void data.submit(); }}>

                    <Stack as="ul" gap={3}>

                        {(step ? effects[step] : []).map(( key ) => (

                            <Stack as="li" key={key} direction="row" align="start" gap={3}>

                                <Icon
                                    name={step === "delete" ? "warning-circle" : "check-circle"}
                                    size="md"
                                    weight="fill"
                                    tone={step === "delete" ? "danger" : "muted"}
                                />

                                <Text size="small" wrap="pretty">{t(key)}</Text>

                            </Stack>

                        ))}

                    </Stack>

                    {hasPassword ? (

                        <PasswordField
                            id="closure-password"
                            label={t("closurePassword")}
                            autoComplete="current-password"
                            value={data.password}
                            error={data.passwordError}
                            disabled={data.pending}
                            onChange={( event ) => data.setPassword(event.target.value)}
                        />

                    ) : confirmation.challenge ? (

                        <ConfirmCode
                            id={confirmation.id}
                            challenge={confirmation.challenge}
                            code={confirmation.code}
                            retry={confirmation.retry}
                            expired={confirmation.expired}
                            disabled={data.pending}
                            onCode={confirmation.setCode}
                            onResend={() => { void data.submit(true); }}
                        />

                    ) : <Text size="small" tone="muted">{t("closureCodeHint")}</Text>}

                    {step === "delete" ? (

                        <Check
                            id="closure-understood"
                            label={t("closureUnderstood")}
                            checked={data.understood}
                            disabled={data.pending}
                            onChange={data.setUnderstood}
                        />

                    ) : null}

                    <FormFeedback id="closure-failure" error={data.error} />

                </Form>

            </Dialog>

        </Stack>

    );

}
