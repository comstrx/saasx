"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { notificationEntry, useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

export const shows = ["all", "unread", "pinned"] as const;

type Show = typeof shows[number];
type Links = { login: string; order: string; ticket: string; wallet: string };

const size = 20;
const buckets = ["today", "yesterday", "earlier"] as const;

export function useInbox ( links: Links ) {

    const t = useTranslations("notifications");
    const locale = useLocale();
    const path = usePathname();
    const search = useSearchParams();
    const toast = useToast();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const asked = search.get("show");
    const show: Show = shows.find(( value ) => value === asked) ?? "all";
    const [limit, setLimit] = useState(size);
    const [busy, setBusy] = useState<number | "all" | null>(null);
    const [opened, setOpened] = useState<number | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [now] = useState(() => Date.now());
    const feed = useNotifications({ limit, ...(show === "unread" ? { read: false } : show === "pinned" ? { pinned: true } : {}) });

    async function act ( id: number | "all", run: () => Promise<unknown> ) {

        setBusy(id);

        try { await run(); }
        catch { toast({ title: t("failed"), tone: "error" }); }
        finally { setBusy(null); feed.reload(); }

    }
    function remove ( id: number ) {

        void act(id, async () => {

            await feed.actions.delete({ notificationId: id });
            toast({
                title: t("deleted"), tone: "info",
                action: { label: t("undo"), onClick: () => { void act(id, () => feed.actions.restore({ notificationId: id })); } },
            });

        });

    }
    function bulk ( kind: "read" | "unread" | "pin" | "unpin" | "delete" ) {

        const ids = [...selected];

        if ( !ids.length ) return;

        void act("all", async () => {

            const done = kind === "read" ? await feed.actions.readMany({ ids }) : kind === "unread" ? await feed.actions.unreadMany({ ids })
                : kind === "pin" ? await feed.actions.pinMany({ ids }) : kind === "unpin" ? await feed.actions.unpinMany({ ids })
                : await feed.actions.deleteMany({ ids });

            if ( !done ) return;

            setSelected([]);
            toast(kind === "delete" ? {
                title: t("deletedMany", { count: ids.length }), tone: "info",
                action: { label: t("undo"), onClick: () => { void act("all", () => feed.actions.restoreMany({ ids })); } },
            } : { title: t(`bulkDone.${kind}`, { count: ids.length }), tone: "success" });

        });

    }

    const items = feed.items.map(( item ) => notificationEntry(item, links, locale, now, t("untitled")));

    return {
        t, show, busy, ready, token, opened, setOpened,
        login: `${localePath(locale, links.login, routing)}?${new URLSearchParams({ next: path })}`,
        loading: feed.loading && !feed.items.length,
        error: feed.error,
        reload: feed.reload,
        unread: feed.stats?.unread ?? 0,
        tabs: shows.map(( value ) => ({
            value, label: t(`groups.${value}`),
            count: value === "unread" ? feed.stats?.unread ?? 0 : value === "pinned" ? feed.stats?.pinned ?? 0 : feed.stats?.count ?? 0,
            href: value === "all" ? path : `${path}?${new URLSearchParams({ show: value })}`,
        })),
        groups: buckets.map(( bucket ) => ({ key: bucket, title: t(bucket), items: items.filter(( item ) => item.bucket === bucket) }))
            .filter(( group ) => group.items.length),
        more: feed.page?.total != null && items.length < feed.page.total ? () => setLimit(( value ) => value + size) : null,
        toggleRead: ( id: number, read: boolean ) => act(id, () => (read
            ? feed.actions.unread({ notificationId: id }) : feed.actions.read({ notificationId: id }))),
        togglePin: ( id: number, pinned: boolean ) => act(id, () => (pinned
            ? feed.actions.unpin({ notificationId: id }) : feed.actions.pin({ notificationId: id }))),
        remove,
        readAll: () => act("all", () => feed.actions.readMany({ all: true })),
        selected, bulk, clearSelection: () => setSelected([]),
        pick: ( id: number, value: boolean ) => setSelected(( current ) => (
            value ? [...new Set([...current, id])] : current.filter(( entry ) => entry !== id)
        )),
    };

}
