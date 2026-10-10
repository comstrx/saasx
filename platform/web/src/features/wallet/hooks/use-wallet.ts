"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Data } from "@/api/features";
import { useRead } from "@/hooks/use-operation";
import { useTrash } from "@/hooks/use-trash";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { day, decimal, money } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

type Transaction = Data<"transactions", "list">;

const size = 20;
const reasons = [
    "deposit", "withdraw", "transfer", "pay", "refund", "cashback", "earning",
    "commission", "fee", "referral", "reward", "adjustment", "points",
] as const;
const icons: Record<string, string> = {
    deposit: "plus", withdraw: "payout", transfer: "share", pay: "card", refund: "reply", cashback: "coins",
    earning: "coins", commission: "deal", fee: "receipt", referral: "users", reward: "gift", adjustment: "sliders", points: "medal",
};
const states = {
    completed: "positive", succeeded: "positive", paid: "positive", settled: "positive",
    pending: "attention", processing: "attention", authorized: "attention",
    failed: "negative", cancelled: "negative", canceled: "negative", refunded: "neutral", expired: "negative",
} as const;
const stateKeys = Object.keys(states) as (keyof typeof states)[];

function numberOf ( value: Parameters<typeof money>[0] ) {

    return typeof value === "object" && value ? value.amount : value;

}
export function useWallet ( login: string ) {

    const t = useTranslations("wallet");
    const locale = useLocale();
    const path = usePathname();
    const search = useSearchParams();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const user = useUi(( state ) => (state.token ? state.user : null));
    const view = search.get("view") === "transactions" ? "transactions" : "statement";
    const [limit, setLimit] = useState(size);
    const [opened, setOpened] = useState<Transaction | null>(null);
    const [dialog, setDialog] = useState<"deposit" | "transfer" | "withdraw" | null>(null);
    const signed = ready && Boolean(token);
    const wallet = useRead("wallet", "read", {}, { enabled: signed });
    const statement = useRead("wallet", "statement", { page: 1, limit }, { enabled: signed && view === "statement" });
    const transactions = useRead("transactions", "list", { page: 1, limit, sort: "newest" }, {
        enabled: signed && view === "transactions",
    });
    const trash = useTrash("transactions", () => { wallet.reload(); transactions.reload(); });
    const currency = wallet.data?.currency ?? "USD";
    const amount = ( value: Parameters<typeof money>[0], fallback = currency ) => money(value, locale, fallback, true);
    const active = view === "statement" ? statement : transactions;
    const total = active.meta?.pagination?.total;
    const shown = (view === "statement" ? statement.data : transactions.data)?.length ?? 0;
    const label = ( key: string ) => reasons.find(( reason ) => reason === key);
    const stateOf = ( key: string ) => stateKeys.find(( state ) => state === key);

    return {
        t, ready, token, view, opened, setOpened, dialog, trash,
        show: ( kind: "deposit" | "transfer" | "withdraw" ) => setDialog(kind),
        toggle: ( kind: "deposit" | "transfer" | "withdraw" ) => ( open: boolean ) => setDialog(open ? kind : null),
        login: `${localePath(locale, login, routing)}?${new URLSearchParams({ next: path })}`,
        loading: wallet.loading && !wallet.data,
        failed: Boolean(wallet.error),
        reload: () => { wallet.reload(); active.reload(); },
        currency,
        balance: wallet.data ? {
            available: amount(wallet.data.available_balance),
            pending: amount(wallet.data.pending_balance),
            total: amount(wallet.data.total_balance),
            points: decimal(wallet.data.points, locale, 0) ?? "0",
        } : null,
        holder: user?.name?.trim() || user?.email || "",
        stats: wallet.data ? [
            { key: "deposits", label: t("stats.deposits"), icon: "plus", amount: amount(wallet.data.total_deposits) },
            { key: "pays", label: t("stats.pays"), icon: "card", amount: amount(wallet.data.total_pays) },
            { key: "refunds", label: t("stats.refunds"), icon: "reply", amount: amount(wallet.data.total_refunds) },
            { key: "cashback", label: t("stats.cashback"), icon: "coins", amount: amount(wallet.data.total_cashback) },
            { key: "referrals", label: t("stats.referrals"), icon: "users", amount: amount(wallet.data.referral_earnings) },
        ] : [],
        tabs: (["statement", "transactions"] as const).map(( value ) => ({
            value, label: t(`tabs.${value}`), href: value === "statement" ? path : `${path}?${new URLSearchParams({ view: value })}`,
        })),
        listLoading: active.loading && !shown,
        listFailed: Boolean(active.error),
        statement: (statement.data ?? []).map(( row ) => {

            const reason = label(row.reason ?? "");
            const credit = row.direction === "in" || row.direction === "credit";

            return {
                key: String(row.id),
                title: reason ? t(`reasons.${reason}`) : row.reason ?? t("movement"),
                detail: row.at ? day(row.at, locale, { dateStyle: "medium", timeStyle: "short" }) : null,
                icon: icons[row.reason ?? ""] ?? "wallet",
                amount: row.unit === "points" ? undefined : amount(row.amount),
                value: row.unit === "points" ? t("pointsValue", { points: decimal(numberOf(row.amount), locale, 0) ?? "0" }) : null,
                credit,
            };

        }),
        transactions: (transactions.data ?? []).map(( row ) => {

            const kind = label(row.type ?? "");

            return {
            row,
            key: String(row.id),
            title: row.description || (kind ? t(`reasons.${kind}`) : row.type ?? t("movement")),
            detail: row.created_at ? day(row.created_at, locale, { day: "numeric", month: "short", year: "numeric" }) : null,
            icon: icons[row.type ?? ""] ?? "wallet",
            amount: amount(row.amount, row.currency ?? currency),
            status: row.status ? {
                label: stateOf(row.status) ? t(`states.${stateOf(row.status) ?? "pending"}`) : row.status,
                tone: states[stateOf(row.status) ?? "refunded"],
            } : null,
            };

        }),
        more: total != null && shown < total ? () => setLimit(( value ) => value + size) : null,
    };

}
