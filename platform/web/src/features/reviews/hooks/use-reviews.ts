"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRead } from "@/hooks/use-operation";
import { useTrash } from "@/hooks/use-trash";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

const size = 10;

export function useReviews ( login: string ) {

    const t = useTranslations("myReviews");
    const locale = useLocale();
    const path = usePathname();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const [limit, setLimit] = useState(size);
    const list = useRead("reviews", "list", { page: 1, limit, sort: "newest" }, { enabled: ready && Boolean(token) });
    const total = list.meta?.pagination?.total;
    const items = list.data ?? [];
    const trash = useTrash("reviews", list.reload);

    return {
        t, ready, token, items,
        login: `${localePath(locale, login, routing)}?${new URLSearchParams({ next: path })}`,
        loading: list.loading && !list.data,
        failed: Boolean(list.error),
        reload: list.reload,
        count: total != null ? t("count", { count: total }) : null,
        more: total != null && items.length < total ? () => setLimit(( value ) => value + size) : null,
        selection: { ids: trash.selection.ids, pick: trash.selection.pick, label: trash.selection.labels.select },
        bulk: trash.selection.ids.length ? {
            count: trash.selection.labels.count, clear: trash.selection.labels.clear, busy: trash.pending, onClear: trash.selection.clear,
            actions: [{
                key: "remove", label: trash.selection.labels.remove, icon: "trash" as const, danger: true,
                onSelect: () => { void trash.hideSelected(); },
            }],
        } : null,
    };

}
