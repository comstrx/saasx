"use client";

import type { ApiClient } from "@/api/core/client";
import { routing } from "@/lib/spec/config";
import { ago, dayBucket } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { fillPattern } from "@/lib/std/route";
import { useUi } from "@/stores/provider";
import { useApi } from "./use-api";
import { useRead } from "./use-operation";

type Filters = NonNullable<Parameters<ApiClient["notifications"]["list"]>[0]>;
type Alert = Awaited<ReturnType<ApiClient["notifications"]["list"]>>["resource"][number];
export type NotificationLinks = { order: string; ticket: string; wallet: string };

export function notificationEntry ( item: Alert, links: NotificationLinks, locale: string, now: number, untitled: string ) {

    const open = ( pattern: string, key: string, id: number ) => localePath(locale, fillPattern(pattern, { [key]: String(id) }), routing);

    return {
        id: item.id,
        title: item.title || untitled,
        body: item.content ?? null,
        read: item.read === true,
        pinned: item.pinned === true,
        when: item.created_at ? ago(item.created_at, locale, now) : null,
        bucket: item.created_at ? dayBucket(item.created_at, now) : "earlier" as const,
        icon: item.order ? "receipt" : item.ticket ? "support" : item.transaction ? "wallet" : item.catalog ? "bag" : "bell",
        href: item.order ? open(links.order, "orderId", item.order.id) : item.ticket ? open(links.ticket, "ticketId", item.ticket.id)
            : item.transaction ? localePath(locale, links.wallet, routing) : null,
    };

}
export function useNotifications ( filters: Filters = {} ) {

    const api = useApi();
    const signedIn = useUi(( state ) => Boolean(state.token && state.user));
    const list = useRead("notifications", "list", filters, { enabled: signedIn, live: "notifications" });
    const stats = useRead("notifications", "stats", {}, { enabled: signedIn, live: "notifications" });

    return {
        items: list.data ?? [],
        page: list.meta?.pagination,
        stats: stats.data,
        loading: list.loading || stats.loading,
        error: list.error ?? stats.error,
        reload: () => { list.reload(); stats.reload(); },
        actions: api.notifications,
    };

}
