"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRead } from "@/hooks/use-operation";
import { useLocale } from "@/lib/providers/intl";
import { browser } from "@/lib/spec/browser";
import { identity, routing } from "@/lib/spec/config";
import { storage } from "@/lib/std/browser";
import { localePath } from "@/lib/std/locale";
import { entityParam, fillPattern } from "@/lib/std/route";
import { searchSuggestion } from "@/lib/std/search";

type Kind = "geo" | "category" | "catalog" | "poi" | "article" | "vendor" | "campaign";
type Hit = { value: string; label: string; detail: string | null; kind: Kind; href: string };
type Paths = { poi: string | null; campaign: string | null };
type Row = { id: number; label?: string | null };

const kinds: Readonly<Record<"geo" | "category" | "catalog" | "article" | "vendor", string>> = {
    geo: "geo", category: "category", catalog: "product", article: "article", vendor: "vendor",
};
const parameters = { poi: "poiId", campaign: "campaignId" } as const;
const recentKey = `${identity}.searches`;
const local = storage("local");

function remembered (): string[] {

    const saved = local.read(recentKey);

    return Array.isArray(saved) ? saved.filter(( entry ): entry is string => typeof entry === "string").slice(0, 6) : [];

}
function linkOf ( kind: Kind, id: string, paths: Paths ): string | null {

    if ( kind === "poi" || kind === "campaign" ) {

        const pattern = paths[kind];

        return pattern ? fillPattern(pattern, { [parameters[kind]]: id }) : null;

    }

    const routes = browser.routes.filter(( route ) => route.kind === kinds[kind]);
    const route = routes.find(( entry ) => !entry.types) ?? routes[0];

    return route ? fillPattern(route.path, { [route.parameter]: entityParam(Number(id), null) }) : null;

}
function hitsOf ( kind: Kind, rows: readonly Row[] | null | undefined, paths: Paths ): Hit[] {

    return (rows ?? []).flatMap(( row ) => {

        const [label = "", ...detail] = (row.label ?? "").split(" · ");
        const href = label ? linkOf(kind, String(row.id), paths) : null;

        return href ? [{ value: `${kind}:${row.id}`, label, detail: detail.join(" · ") || null, kind, href }] : [];

    });

}
export function useGlobalSearch ( search: string | null, paths: Paths ) {

    const router = useRouter();
    const locale = useLocale();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [recent, setRecent] = useState<string[]>([]);
    const term = useDeferredValue(query.trim());
    const wanted = open && term.length >= 2;
    const suggestions = useRead("search", "suggest", { query: term, limit: 12 }, { enabled: wanted });
    const listings = useRead("products", "suggest", { query: term, limit: 6 }, { enabled: wanted });
    const stories = useRead("articles", "suggest", { query: term, limit: 4 }, { enabled: wanted });
    const hosts = useRead("vendors", "suggest", { query: term, limit: 4 }, { enabled: wanted });
    const deals = useRead("campaigns", "suggest", { query: term, limit: 4 }, { enabled: wanted });
    const spots = useRead("pois", "suggest", { query: term, limit: 4 }, { enabled: wanted });
    const reads = [suggestions, listings, stories, hosts, deals, spots];
    const hits = useMemo(() => [
        ...hitsOf("catalog", listings.data, paths),
        ...(suggestions.data ?? []).flatMap(( row ): Hit[] => {

            const place = searchSuggestion(row);

            return place && (place.kind === "geo" || place.kind === "category") ? hitsOf(place.kind, [row], paths) : [];

        }),
        ...hitsOf("poi", spots.data, paths),
        ...hitsOf("campaign", deals.data, paths),
        ...hitsOf("article", stories.data, paths),
        ...hitsOf("vendor", hosts.data, paths),
    ], [suggestions.data, listings.data, stories.data, hosts.data, deals.data, spots.data, paths]);

    useEffect(() => {

        function shortcut ( event: KeyboardEvent ) {

            const target = event.target as HTMLElement | null;
            const typing = target?.closest("input, textarea, select, [contenteditable='true']");

            if ( (event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey) ) {

                event.preventDefault();
                setOpen(( value ) => !value);

            }
            else if ( event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey ) {

                event.preventDefault();
                setOpen(true);

            }

        }

        window.addEventListener("keydown", shortcut);

        return () => window.removeEventListener("keydown", shortcut);

    }, []);

    function change ( next: boolean ) {

        setOpen(next);

        if ( next ) setRecent(remembered());
        else setQuery("");

    }
    function keep ( text: string ) {

        const clean = text.trim();

        if ( !clean ) return;

        local.write(recentKey, [clean, ...remembered().filter(( entry ) => entry !== clean)].slice(0, 6));

    }
    function go ( href: string ) {

        change(false);
        router.push(localePath(locale, href, routing) as Route);

    }
    function select ( value: string ) {

        const hit = hits.find(( entry ) => entry.value === value);

        if ( !hit ) return;

        keep(hit.label);
        go(hit.href);

    }
    function submit ( text: string ) {

        if ( !search ) return;

        keep(text);
        go(`${search}?${new URLSearchParams({ query: text })}`);

    }
    function forget () {

        local.write(recentKey, null);
        setRecent([]);

    }

    return {
        open,
        change,
        query,
        setQuery,
        recent,
        forget,
        hits,
        busy: wanted && (reads.some(( read ) => read.loading) || query.trim() !== term),
        failed: wanted && reads.every(( read ) => Boolean(read.error)),
        select,
        submit,
        reuse: ( text: string ) => setQuery(text),
        visit: go,
    };

}
