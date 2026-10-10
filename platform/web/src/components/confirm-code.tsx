"use client";

import type { Confirmation } from "@/api/core/response";
import Button from "@/elements/button";
import OtpInput from "@/elements/otp-input";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useTranslations } from "@/lib/providers/intl";

type Props = {
    id: string; challenge: Confirmation; code: string; retry: number; expired?: boolean; disabled?: boolean;
    onCode: ( code: string ) => void; onResend: () => void;
};

export default function ConfirmCode ({ id, challenge, code, retry, expired, disabled, onCode, onResend }: Props) {

    const auth = useTranslations("auth");
    const length = challenge.length ?? 6;

    return (

        <Stack gap={3}>

            <Text size="small" tone="muted">

                {auth(challenge.sent ? "codeSent" : "codePending", {
                    destination: `⁨${challenge.destination ?? ""}⁩`, channel: challenge.channel ?? "",
                })}

            </Text>

            {expired ? <Text role="alert" tone="danger" size="small">{auth("otpExpired")}</Text> : (

                <OtpInput
                    id={id} label={auth("otpLabel")} hint={auth("otpHint")} length={length} value={code} disabled={disabled}
                    slotLabel={( index ) => auth("otpSlot", { index, length })} onValueChange={onCode}
                />

            )}

            <Stack direction="row">

                <Button variant="ghost" size="small" disabled={disabled || retry > 0} onClick={onResend}>

                    {retry > 0 ? auth("resendIn", { seconds: retry }) : auth("resend")}

                </Button>

            </Stack>

        </Stack>

    );

}
