"use client";

import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { day } from "@/lib/std/format";

export function useNotificationDetails ( notificationId: number | null ) {

    const t = useTranslations("notifications");
    const locale = useLocale();
    const view = useRead("notifications", "view", { notificationId: notificationId ?? 0 }, { enabled: notificationId != null });
    const row = view.data;

    return {
        t,
        title: row?.title || t("untitled"),
        body: row?.content ?? null,
        loading: view.loading && !row,
        failed: Boolean(view.error),
        reload: view.reload,
        facts: row ? [
            {
                key: "time", term: t("detail.time"), icon: "clock",
                detail: row.created_at ? day(row.created_at, locale, { dateStyle: "medium", timeStyle: "short" }) : undefined,
            },
            { key: "status", term: t("detail.status"), icon: "checks", detail: t(row.read ? "detail.read" : "detail.unread") },
        ].filter(( fact ) => fact.detail) : [],
    };

}
