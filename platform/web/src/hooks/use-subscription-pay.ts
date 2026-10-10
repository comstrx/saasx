"use client";

import { useRef, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useAction, useRead } from "@/hooks/use-operation";
import { usePaymentChoices } from "@/hooks/use-payment-choices";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";
import { uuid } from "@/lib/std/security";

export function useSubscriptionPay ( subscriptionId: number | null, onDone: () => void ) {

    const t = useTranslations("subscriptions");
    const toast = useToast();
    const gateways = useRead("gateways", "list", {}, { enabled: subscriptionId != null });
    const pay = useAction("subscriptions", "pay");
    const [method, setMethod] = useState("wallet");
    const [currency, setCurrency] = useState("");
    const attempt = useRef<string | null>(null);
    const confirmation = useConfirmation(pay.error, String(subscriptionId ?? 0), pay.pending, pay.clear);
    const choices = usePaymentChoices(gateways.data ?? [], method);
    const failure = useAuthError(pay.error);

    async function submit ( resend = false ) {

        if ( !subscriptionId || pay.pending ) return;

        attempt.current ??= uuid();

        const gateway = method.startsWith("gateway:")
            ? { gateway_id: Number(method.slice(8)), ...(currency ? { payment_currency: currency } : {}) } : {};
        const result = await pay.run({
            subscriptionId, ...gateway,
            ...(confirmation.challenge && confirmation.code && !resend ? { confirm_code: confirmation.code } : {}),
            redirect_url: window.location.href, failed_url: window.location.href,
        }, { idempotencyKey: attempt.current });

        if ( !result ) return;

        attempt.current = null;

        const target = result.resource.pay_url || result.resource.pay_data?.pay_url;

        if ( target && /^https?:\/\//.test(target) ) {

            window.location.assign(target);
            return;

        }

        toast({ title: t("paid"), tone: "success" });
        onDone();

    }

    return {
        choices, method, setMethod, currency, setCurrency, confirmation, submit,
        pending: pay.pending,
        loading: gateways.loading && !gateways.data,
        error: pay.error?.confirmation ? null : failure,
    };

}
