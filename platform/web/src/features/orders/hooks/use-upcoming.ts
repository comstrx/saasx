"use client";

import { useState } from "react";
import { useRead } from "@/hooks/use-operation";
import { useOrderRecord } from "@/hooks/use-order-record";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { day } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

const closed = new Set(["completed", "cancelled", "canceled", "failed", "expired", "refunded"]);

export function useUpcoming ( order: string, list: string ) {

    const t = useTranslations("orders");
    const locale = useLocale();
    const signed = useUi(( state ) => Boolean(state.ready && state.token));
    const [today] = useState(() => new Date().toISOString().slice(0, 10));
    const [now] = useState(() => Date.now());
    const request = useRead("orders", "list", { page: 1, limit: 30, sort: "newest" }, { enabled: signed });
    const shape = useOrderRecord(order);
    const next = (request.data ?? [])
        .map(( row ) => ({ row, at: (row.starts_at ?? row.scheduled_at ?? "").slice(0, 10) }))
        .filter(( entry ) => entry.at && entry.at >= today && !closed.has(entry.row.status ?? ""))
        .sort(( a, b ) => a.at.localeCompare(b.at))[0];

    if ( !next ) return null;

    const starts = next.row.starts_at ?? next.row.scheduled_at ?? "";
    const left = Math.max(0, Math.round((Date.parse(`${next.at}T00:00:00`) - new Date(now).setHours(0, 0, 0, 0)) / 86400000));

    return {
        ...shape(next.row),
        when: {
            month: day(starts, locale, { month: "short" }),
            day: day(starts, locale, { day: "numeric" }),
            weekday: day(starts, locale, { weekday: "short" }),
            label: day(starts, locale, { weekday: "long", day: "numeric", month: "long" }),
        },
        countdown: t("startsIn", { days: left }),
        labels: { title: t("upcomingTitle"), body: t("upcomingBody"), all: t("allBookings") },
        all: localePath(locale, list, routing),
    };

}
