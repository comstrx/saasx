"use client";

import FormFeedback from "@/components/form-feedback";
import PasswordFields from "@/components/password-fields";
import Button from "@/elements/button";
import Form from "@/elements/form";
import OtpInput from "@/elements/otp-input";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useTranslations } from "@/lib/providers/intl";
import type { AuthValues, Challenge } from "@/lib/std/auth";

type Props = {
    challenge: Challenge; values: AuthValues; errors: Record<string, string>; passwordHint: string;
    recovery: boolean; expired: boolean; retry: number; resent: boolean; pending: boolean; resending: boolean;
    error: string | null; id: ( field: string ) => string; onChange: ( patch: Partial<AuthValues> ) => void;
    onSubmit: () => void; onResend: () => void; onRestart: () => void;
};

export default function VerificationForm ({
    challenge, values, errors, passwordHint, recovery, expired, retry, resent, pending, resending,
    error, id, onChange, onSubmit, onResend, onRestart,
}: Props) {

    const t = useTranslations("auth");
    const blocked = expired || challenge.locked;
    const destination = `\u2068${challenge.destination}\u2069`;
    const introduction = t(challenge.sent ? "codeSent" : "codePending", { destination, channel: challenge.channel });

    return (

        <Form pending={pending} noValidate onSubmit={( event ) => { event.preventDefault(); onSubmit(); }}>

            <Text size="small" tone="muted">{introduction}</Text>

            {blocked ? <FormFeedback id={id("otp")} error={t(challenge.locked ? "codeLocked" : "otpExpired")} /> : (

                <OtpInput
                    id={id("otp")} label={t("otpLabel")} hint={t("otpHint")} length={challenge.length}
                    value={values.otp} disabled={pending} error={errors.otp}
                    slotLabel={( index ) => t("otpSlot", { index, length: challenge.length })}
                    onValueChange={( otp ) => onChange({ otp })}
                />

            )}

            {recovery && !blocked ? (

                <PasswordFields
                    id={id} password={values.password} confirm={values.confirm} errors={errors}
                    hint={passwordHint} disabled={pending} onChange={onChange}
                />

            ) : null}

            {error ? <FormFeedback id={id("failure")} error={error} /> : null}

            {!blocked ? (

                <Button type="submit" width="full" size="large" pending={pending}>

                    {t(recovery ? (pending ? "saving" : "savePassword") : (pending ? "verifying" : "verify"))}

                </Button>

            ) : null}

            <Stack gap={2}>

                <Text size="small" tone="muted" align="center">

                    {retry > 0 ? t("resendIn", { seconds: retry }) : t("resendReady")}

                </Text>

                <FormFeedback id={id("resent")} message={resent ? t("resent") : null} />

                <Button variant="outlined" width="full" disabled={retry > 0 || pending} pending={resending} onClick={onResend}>

                    {t(resending ? "sending" : "resend")}

                </Button>

                <Button variant="ghost" width="full" disabled={pending} onClick={onRestart}>{t("changeIdentity")}</Button>

            </Stack>

        </Form>

    );

}
