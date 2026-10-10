"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { bucketOf, queryHref } from "@/lib/std/listing";
import { asciiNumber } from "@/lib/std/number";

type Options = {
    floor: number; ceiling: number; from: number; to: number; edges: readonly number[]; bars: readonly { count: number }[];
};

const charting = 12;

function amount ( value: string, fallback: number ): number {

    return /^\d{1,12}(?:\.\d{1,6})?$/.test(value) ? Number(value) : fallback;

}
export function usePriceFacet ( { floor, ceiling, from, to, edges, bars }: Options ) {

    const id = useId();
    const router = useRouter();
    const path = usePathname();
    const params = useSearchParams();
    const [pending, startTransition] = useTransition();
    const [draft, setDraft] = useState({ min: from > floor ? String(from) : "", max: to < ceiling ? String(to) : "" });
    const low = Math.max(floor, Math.min(amount(draft.min, floor), ceiling));
    const high = Math.min(ceiling, Math.max(amount(draft.max, ceiling), low));
    const last = Math.max(0, edges.length - 2);

    function push ( minPrice: string | null, maxPrice: string | null ) {

        const href = queryHref(path, Object.fromEntries(params), { minPrice, maxPrice, page: null });

        startTransition(() => router.push(href as Route, { scroll: false }));

    }

    return {
        id,
        pending,
        draft,
        value: [low, high] as const,
        charted: bars.reduce(( sum, bar ) => sum + bar.count, 0) >= charting,
        active: [Math.max(0, bucketOf(edges, low)), bucketOf(edges, high) < 0 ? last : bucketOf(edges, high)] as const,
        dirty: low !== from || high !== to,
        narrowed: from > floor || to < ceiling,
        slide: ( [lower, upper]: readonly [number, number] ) => setDraft({
            min: lower <= floor ? "" : String(lower),
            max: upper >= ceiling ? "" : String(upper),
        }),
        type: ( key: "min" | "max", value: string ) => setDraft(( previous ) => ({
            ...previous, [key]: asciiNumber(value).replace(/[^\d.]/g, ""),
        })),
        apply: () => push(low > floor ? String(low) : null, high < ceiling ? String(high) : null),
        reset: () => push(null, null),
    };

}
