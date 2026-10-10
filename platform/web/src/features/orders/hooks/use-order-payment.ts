"use client";

import { useState } from "react";
import type { Data } from "@/api/features";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useAction, useRead } from "@/hooks/use-operation";
import { usePaymentChoices } from "@/hooks/use-payment-choices";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { money } from "@/lib/std/format";

import { useOrderAttempt } from "./use-order-attempt";

type Bound = { data: Data<"orders", "quote">; signature: string };

export function useOrderPayment ( orderId: number ) {

    const t = useTranslations("checkout");
    const locale = useLocale();
    const gateways = useRead("gateways", "list");
    const quote = useAction("orders", "quote");
    const pay = useOrderAttempt("pay", orderId);
    const [method, setMethod] = useState("wallet");
    const [currency, setCurrency] = useState("");
    const [bound, setBound] = useState<Bound | null>(null);
    const done = pay.receipt;
    const input = {
        orderId, ...(method.startsWith("gateway:") ? {
            gateway_id: Number(method.slice(8)), ...(currency ? { payment_currency: currency } : {}),
        } : {}),
    };
    const signature = JSON.stringify(input);
    const current = bound?.signature === signature ? bound.data : null;
    const { locked, unresolved } = pay;
    const confirmation = useConfirmation(pay.error, current?.quote_token ?? "", locked, pay.clear);
    const frozen = pay.attempt?.input;
    const selectedMethod = frozen ? frozen.gateway_id ? `gateway:${frozen.gateway_id}` : "wallet" : method;
    const selectedCurrency = frozen?.payment_currency ?? currency;
    const choices = usePaymentChoices(gateways.data ?? [], selectedMethod);
    const amount = current ? money(current.leg, locale, current.currency ?? "USD", true) : undefined;
    const failure = pay.error ?? quote.error;
    const href = done?.href;

    async function review () {

        if ( locked || quote.pending ) return;

        setBound(null);

        const answer = await quote.run(input);

        if ( answer ) setBound({ data: answer.resource, signature });

    }
    async function submit ( resend = false ) {

        if ( pay.attempt ) {

            await pay.run();
            return;

        }

        if ( !current || pay.pending || done || resend && confirmation.retry > 0 ) return;

        if ( !resend && confirmation.challenge
            && (confirmation.expired || confirmation.code.length !== confirmation.challenge.length) ) return;

        await pay.run({
            ...input, amount: String(current.leg), quote_token: current.quote_token,
            ...(confirmation.code && !resend ? { confirm_code: confirmation.code } : {}),
            redirect_url: window.location.href, failed_url: window.location.href,
        }, current.currency ?? undefined);

    }

    return {
        ...confirmation, choices, method: selectedMethod, setMethod, currency: selectedCurrency, setCurrency,
        locked, amount, current, review, submit,
        recovery: !!pay.attempt || pay.blocked, blocked: pay.blocked, ready: pay.ready,
        recoveryMessage: t(pay.storageIssue ? "storageUnavailable" : pay.blocked ? "recoveryBlocked"
            : pay.pending ? "processingPayment" : "uncertainPayment"),
        pending: pay.pending, reviewing: quote.pending, done: !!done, href, unresolved,
        gatewayFailure: gateways.error ? t("gatewayUnavailable") : null,
        message: unresolved ? t("uncertainPayment") : failure && !failure.confirmation
            ? Object.values(failure.errors).flat()[0] || t("failed") : null,
        refresh: !!pay.error?.errors.quote_token,
        label: amount ? t("payAmount", { amount: `\u2068${amount.number} ${amount.currency}\u2069` }) : t("placeOrder"),
    };

}
