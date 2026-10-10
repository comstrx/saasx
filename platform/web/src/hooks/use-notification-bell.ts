"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type NotificationLinks, notificationEntry } from "@/hooks/use-notifications";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/providers/intl";

type Labels = { untitled: string; failed: string };

export function useNotificationBell ( links: NotificationLinks, labels: Labels ) {

    const router = useRouter();
    const locale = useLocale();
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const stats = useRead("notifications", "stats", {}, { live: "notifications" });
    const feed = useRead("notifications", "list", { limit: 6, ...(unreadOnly ? { read: false } : {}) }, {
        enabled: open, live: "notifications",
    });
    const read = useAction("notifications", "read");
    const readAll = useAction("notifications", "readMany");
    const items = (feed.data ?? []).map(( item ) => notificationEntry(item, links, locale, now, labels.untitled));

    function change ( next: boolean ) {

        setOpen(next);

        if ( next ) setNow(Date.now());

    }
    async function visit ( id: number, href: string | null, seen: boolean ) {

        setOpen(false);

        if ( !seen ) void read.run({ notificationId: id }).catch(() => undefined);
        if ( href ) router.push(href as Route);

    }
    async function markAll () {

        try { await readAll.run({ all: true }); }
        catch { toast({ title: labels.failed, tone: "error" }); }

    }

    return {
        open,
        change,
        unread: stats.data?.unread ?? 0,
        unreadOnly,
        setUnreadOnly,
        items,
        loading: feed.loading && !feed.data,
        failed: Boolean(feed.error) && !feed.data,
        reload: feed.reload,
        visit,
        markAll,
        marking: readAll.pending,
    };

}
