"use client";

import { useState } from "react";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { money } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import type { Review } from "./use-checkout-form";
import type { CheckoutLinks } from "./use-checkout-route";
import type { PurchaseAttempt } from "./use-order-attempt";

export function useSettlement ( action: PurchaseAttempt, review: Review | null, method: string, links: CheckoutLinks, cartId?: number ) {

    const t = useTranslations("checkout");
    const locale = useLocale();
    const [kind, setKind] = useState("full");
    const result = action.receipt;
    const choices = (review?.quote.payment_options ?? []).filter(( option ) => option.allowed && option.due_now != null);
    const option = choices.find(( row ) => row.kind === kind) ?? choices[0];
    const { locked, unresolved } = action;
    const confirmation = useConfirmation(action.error, review?.quote.quote_token ?? "", locked, action.clear);
    const { code, challenge, retry, expired } = confirmation;
    const href = result ? localePath(locale, links.order.replace(":orderId", String(result.orderId)), routing) : "";
    const payUrl = result?.href;
    const error = action.error;
    const frozen = action.attempt;
    const recoveryAmount = frozen?.input.amount && frozen.currency
        ? money(frozen.input.amount, locale, frozen.currency, true) : null;

    async function submit ( resend = false ) {

        if ( action.attempt ) {

            await action.run();
            return;

        }

        if ( !review || action.pending || result || !option || resend && retry > 0 ) return;
        if ( !resend && challenge && (expired || code.length !== challenge.length) ) return;

        const token = review.quote.quote_token;

        const { productId, ...booking } = review.input;
        const payload = {
            ...booking, ...review.contact, ...(cartId ? { cartId } : { productId }), quote_token: token,
            pay_type: method.startsWith("gateway:") ? "directly" as const : method === "later" ? "later" as const : "wallet" as const,
            ...(method !== "later" ? { amount: String(option.due_now) } : {}),
            ...(code && !resend ? { confirm_code: code } : {}),
        };
        await action.run(payload, option.currency ?? review.quote.currency ?? undefined);

    }

    return {
        ...confirmation, submit, pending: action.pending, locked, unresolved, result, href, payUrl, retry, expired,
        kind: option?.kind ?? "", setKind, selected: option,
        choices: choices.map(( row ) => {

            const due = money(row.due_now, locale, row.currency ?? review?.quote.currency ?? "USD", true);
            const later = money(row.due_later, locale, row.currency ?? review?.quote.currency ?? "USD", true);

            return {
                value: row.kind, label: t(row.kind === "deposit" ? "deposit" : "full"),
                detail: due ? t("dueChoice", {
                    now: `\u2068${due.number} ${due.currency}\u2069`, later: `\u2068${later?.number ?? "0"} ${due.currency}\u2069`,
                }) : undefined,
            };

        }),
        message: unresolved ? t("uncertain") : error && !error.confirmation
            ? Object.values(error.errors).flat()[0] || t("failed") : null,
        refresh: !!error?.errors.quote_token,
        failedPayment: result?.failed === true,
        recovery: !!action.attempt || action.blocked,
        blocked: action.blocked, ready: action.ready, restart: action.restart,
        recoveryAmount: recoveryAmount ? t("payAmount", {
            amount: `\u2068${recoveryAmount.number} ${recoveryAmount.currency}\u2069`,
        }) : undefined,
        recoveryMessage: t(action.storageIssue ? "storageUnavailable" : action.blocked ? "recoveryBlocked"
            : action.pending ? "placing" : "uncertain"),
    };

}
