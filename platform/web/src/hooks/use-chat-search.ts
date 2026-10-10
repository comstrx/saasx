"use client";

import { useEffect, useState } from "react";
import { useRead } from "@/hooks/use-operation";
import { useLocale } from "@/lib/providers/intl";
import { ago } from "@/lib/std/format";

export function useChatSearch ( query: string, href: ( roomId: number ) => string ) {

    const locale = useLocale();
    const [asked, setAsked] = useState("");
    const [now] = useState(() => Date.now());
    const results = useRead("chat", "search", { search: asked, limit: 20 }, { enabled: asked.length >= 2 });

    useEffect(() => {

        const timer = window.setTimeout(() => setAsked(query.trim()), 300);

        return () => window.clearTimeout(timer);

    }, [query]);

    return {
        active: asked.length >= 2,
        loading: results.loading,
        items: (results.data ?? []).flatMap(( row ) => row.room?.id ? [{
            key: String(row.id),
            href: href(row.room.id),
            title: row.sender?.name ?? "",
            text: row.content ?? "",
            time: row.created_at ? ago(row.created_at, locale, now) : null,
        }] : []),
    };

}
