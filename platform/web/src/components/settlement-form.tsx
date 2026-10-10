"use client";

import type { Confirmation } from "@/api/core/response";
import Button from "@/elements/button";
import Choices from "@/elements/choices";
import Form from "@/elements/form";
import OtpInput from "@/elements/otp-input";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useTranslations } from "@/lib/providers/intl";
import FormFeedback from "./form-feedback";

type Props = {
    actionLabel?: string; pendingLabel?: string; showPlans?: boolean; commitment?: boolean; id: string; method: string; kind: string;
    choices: readonly { value: string; label: string; detail?: string }[];
    pending: boolean; disabled?: boolean; unresolved: boolean; message: string | null; refresh: boolean;
    code: string; challenge?: Confirmation; retry: number; expired?: boolean;
    onKind: ( value: string ) => void; onCode: ( value: string ) => void;
    onSubmit: ( resend?: boolean ) => void; onRefresh: () => void;
};

export default function SettlementForm ({
    actionLabel, pendingLabel, showPlans = true, commitment = true, id, method, kind, choices,
    pending, disabled, unresolved, message, refresh,
    code, challenge, retry, expired,
    onKind, onCode, onSubmit, onRefresh,
}: Props) {

    const t = useTranslations("checkout");
    const auth = useTranslations("auth");
    const length = challenge?.length;
    const validCode = length != null && length >= 1 && length <= 20;

    return (

        <Form pending={pending} onSubmit={( event ) => { event.preventDefault(); if ( !disabled ) onSubmit(); }}>

            {showPlans && method !== "later" && choices.length ? (

                <Choices
                    label={t("paymentPlan")} value={kind} options={choices}
                    disabled={disabled || pending || unresolved || !!challenge} onValueChange={onKind}
                />

            ) : null}

            {method === "later" ? <Text size="small" tone="muted">{t("laterHint")}</Text> : null}

            {challenge ? (

                <Stack gap={3}>

                    <Text size="small" tone="muted">

                        {auth(challenge.sent ? "codeSent" : "codePending", {
                            destination: `⁨${challenge.destination ?? ""}⁩`, channel: challenge.channel ?? "",
                        })}

                    </Text>

                    {validCode && !expired ? (

                        <OtpInput
                            id={id} label={auth("otpLabel")} hint={auth("otpHint")} length={length} value={code}
                            disabled={disabled || pending} slotLabel={( index ) => auth("otpSlot", { index, length })}
                            onValueChange={onCode}
                        />

                    ) : <Text role="alert" tone="danger" size="small">{auth(expired ? "otpExpired" : "requestFailed")}</Text>}

                    <Button variant="outlined" disabled={disabled || retry > 0 || pending} onClick={() => onSubmit(true)}>

                        {retry > 0 ? auth("resendIn", { seconds: retry }) : auth("resend")}

                    </Button>

                </Stack>

            ) : null}

            <FormFeedback id={`${id}-failure`} error={message} />

            {refresh && !unresolved ? (

                <Button variant="outlined" width="full" disabled={disabled} onClick={onRefresh}>{t("refreshPrice")}</Button>

            ) : (

                <Button type="submit" width="full" size="large" pending={pending} disabled={disabled || !choices.length || !!expired}>

                    {pending ? pendingLabel ?? t(commitment ? "placing" : "processingPayment")
                        : unresolved ? t(commitment ? "retryOrder" : "retryPayment")
                        : actionLabel ?? t(method === "later" ? "reserve" : "placeOrder")}

                </Button>

            )}

            {commitment ? <Text size="small" tone="muted">{t("commitHint")}</Text> : null}

        </Form>

    );

}
