"use client";

import { useState } from "react";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useAction, useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { day, money } from "@/lib/std/format";

export function useTransactionDialog ( transactionId: number | null, onChanged: () => void ) {

    const t = useTranslations("wallet");
    const locale = useLocale();
    const view = useRead("transactions", "view", { transactionId: transactionId ?? 0 }, { enabled: transactionId != null });
    const cancel = useAction("transactions", "cancel");
    const refund = useAction("transactions", "refund");
    const [asked, setAsked] = useState<"cancel" | "refund" | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const confirmation = useConfirmation(refund.error, String(transactionId ?? 0), refund.pending, refund.clear);
    const row = view.data;
    const currency = row?.currency ?? "USD";
    const stamp = ( value: string ) => day(value, locale, { dateStyle: "medium", timeStyle: "short" });
    const amount = ( value: Parameters<typeof money>[0] ) => {

        const found = money(value, locale, currency, true);

        return found ? found.before ? `${found.currency} ${found.number}` : `${found.number} ${found.currency}` : null;

    };

    async function run ( resend = false ) {

        if ( !transactionId || !asked ) return;

        const answer = asked === "cancel" ? await cancel.run({ transactionId })
            : await refund.run({
                transactionId, ...(confirmation.challenge && confirmation.code && !resend ? { confirm_code: confirmation.code } : {}),
            });

        if ( !answer ) return;

        if ( asked === "refund" ) {

            const target = "pay_url" in answer.resource ? answer.resource.pay_url : null;

            if ( target && /^https?:\/\//.test(target) ) {

                window.location.assign(target);
                return;

            }

        }

        setNotice(t(asked === "cancel" ? "cancelled" : "refundRequested"));
        setAsked(null);
        view.reload();
        onChanged();

    }

    return {
        t, asked, setAsked, notice, confirmation, run,
        loading: view.loading && !row,
        failed: Boolean(view.error),
        reload: view.reload,
        pending: cancel.pending || refund.pending,
        error: (cancel.error ?? refund.error) && !refund.error?.confirmation
            ? Object.values((cancel.error ?? refund.error)?.errors ?? {}).flat()[0] || t("failed") : null,
        canCancel: row?.can_cancel === true,
        canRefund: row?.can_refund === true || row?.allow_refund === true,
        facts: row ? [
            { key: "reference", term: t("reference"), detail: row.reference ?? `#${row.id}`, icon: "receipt" },
            ...(row.type ? [{ key: "type", term: t("type"), detail: row.type, icon: "tag" }] : []),
            ...(row.status ? [{ key: "status", term: t("status"), detail: row.status, icon: "seal" }] : []),
            ...(row.payment ? [{ key: "payment", term: t("payment"), detail: row.payment, icon: "card" }] : []),
            ...(amount(row.amount) ? [{ key: "amount", term: t("amount"), detail: amount(row.amount) ?? "", icon: "wallet" }] : []),
            ...(amount(row.paid_amount) ? [{
                key: "paid", term: t("paid"), detail: amount(row.paid_amount) ?? "", icon: "check-circle",
            }] : []),
            ...(amount(row.refunded_amount) ? [{
                key: "refunded", term: t("refunded"), detail: amount(row.refunded_amount) ?? "", icon: "reply",
            }] : []),
            ...(amount(row.penalty) ? [{ key: "penalty", term: t("penalty"), detail: amount(row.penalty) ?? "", icon: "warning" }] : []),
            ...(row.created_at ? [{ key: "date", term: t("date"), detail: stamp(row.created_at), icon: "calendar" }] : []),
        ] : [],
        free: row?.free_before ? t("freeBefore", { date: stamp(row.free_before) }) : null,
        description: row?.description ?? null,
    };

}
