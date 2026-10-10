"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTrash } from "@/hooks/use-trash";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { orderDate } from "@/lib/std/orders";
import { initials } from "@/lib/std/text";
import { useUi } from "@/stores/provider";

export function useReferrals ( login: string ) {

    const t = useTranslations("referrals");
    const locale = useLocale();
    const path = usePathname();
    const toast = useToast();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const signed = ready && Boolean(token);
    const account = useRead("account", "read", {}, { enabled: signed });
    const list = useRead("referrals", "list", { limit: 50 }, { enabled: signed });
    const trash = useTrash("referrals", () => list.reload());
    const [copied, setCopied] = useState(false);
    const [opened, setOpened] = useState<number | null>(null);
    const referral = account.data?.user.referral;
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const link = referral?.path ? new URL(referral.path, origin || "https://localhost").toString() : null;

    async function copy ( value?: string ) {

        const text = value ?? link ?? referral?.code ?? "";

        if ( !text ) return;

        const done = await navigator.clipboard?.writeText(text).then(() => true, () => false);

        setCopied(Boolean(done));
        toast({ title: t(done ? "copied" : "copyFailed"), tone: done ? "success" : "error" });

    }
    async function drop ( id: number ) {

        if ( await trash.hide(id) ) setOpened(null);

    }

    const promo = useTranslations("promotions");
    const search = useTranslations("search");

    return {
        t, ready, token, copy, drop, copied, opened, setOpened,
        selection: { ids: trash.selection.ids, pick: trash.selection.pick, label: trash.selection.labels.select },
        bulk: trash.selection.ids.length ? {
            count: trash.selection.labels.count, clear: trash.selection.labels.clear, busy: trash.pending, onClear: trash.selection.clear,
            actions: [{
                key: "remove", label: trash.selection.labels.remove, icon: "trash" as const, danger: true,
                onSelect: () => { void trash.hideSelected(); },
            }],
        } : null,
        promotionLabels: {
            title: promo("title"), body: promo("body"), create: promo("create"), createTitle: promo("createTitle"),
            createBody: promo("createBody"), name: promo("name"), nameHint: promo("nameHint"), expires: promo("expires"),
            save: promo("save"), cancel: promo("cancel"), close: promo("close"), copy: promo("copy"), remove: promo("remove"),
            live: promo("live"), expired: promo("expired"), until: promo("until"), general: promo("general"),
            emptyTitle: promo("emptyTitle"), emptyBody: promo("emptyBody"), failed: promo("failed"), retry: promo("retry"),
            copied: promo("copied"), copyFailed: promo("copyFailed"), created: promo("created"), removed: promo("removed"),
            noExpiry: promo("noExpiry"), clear: search("clearDates"), done: search("done"), edit: promo("edit"),
            editTitle: promo("editTitle"), editBody: promo("editBody"), updated: promo("updated"),
        },
        login: `${localePath(locale, login, routing)}?${new URLSearchParams({ next: path })}`,
        loading: account.loading && !account.data,
        failed: Boolean(account.error),
        reload: () => { account.reload(); list.reload(); },
        code: referral?.code ?? null,
        link,
        shares: Object.entries(referral?.urls ?? {}).filter(( [, url] ) => /^https?:\/\//.test(url)).map(( [name, url] ) => ({
            key: name, url, label: name === "client" || name === "vendor" || name === "delivery" ? t(`audiences.${name}`) : name,
        })),
        total: account.data?.user.referrals ?? list.data?.length ?? 0,
        busy: trash.pending,
        items: (list.data ?? []).map(( row ) => ({
            key: String(row.id), id: row.id,
            name: row.referred?.name || t("friend"),
            image: row.referred?.image ?? null,
            initials: initials(row.referred?.name || t("friend")),
            date: row.created_at ? t("joined", { date: orderDate(row.created_at, locale) ?? "" }) : null,
            active: row.active === true,
        })),
        listLoading: list.loading && !list.data,
    };

}
