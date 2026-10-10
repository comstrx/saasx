"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { useRead } from "@/hooks/use-operation";
import { queryHref } from "@/lib/std/listing";

export function usePlaceFacet () {

    const id = useId();
    const router = useRouter();
    const path = usePathname();
    const params = useSearchParams();
    const [term, setTerm] = useState("");
    const [pending, startTransition] = useTransition();
    const wanted = term.trim().length >= 2;
    const suggestions = useRead("geos", "complete", { query: term.trim(), limit: 8 }, { enabled: wanted });
    const places = wanted ? (suggestions.data?.items ?? []).map(( row ) => ({
        id: String(row.geo_id ?? row.id), label: row.name ?? "", detail: (row.trail ?? []).join(" · ") || null,
    })).filter(( row ) => row.label) : [];

    return {
        id,
        term,
        setTerm,
        pending,
        places,
        searching: wanted && suggestions.loading,
        empty: wanted && !suggestions.loading && Boolean(suggestions.data) && !places.length,
        choose: ( value: string | null ) => {

            const place = places.find(( row ) => row.id === value);

            if ( !place ) return;

            const href = queryHref(path, Object.fromEntries(params), { geo: place.id, where: place.label, page: null });

            setTerm("");
            startTransition(() => router.push(href as Route, { scroll: false }));

        },
    };

}
