"use client";

import packed from "@spec/browser";
import { unpackContract } from "@/api/core/pack";
import { entityParam, fillPattern } from "@/lib/std/route";

type Item = { id: number; slug?: string | null; type?: string | null };

export const browser = { ...packed, contract: unpackContract(packed.contract) };

export function entityLink ( kind: string, item: Item ): string | null {

    const routes = browser.routes.filter(( route ) => route.kind === kind);
    const route = routes.find(( entry ) => item.type && entry.types?.includes(item.type)) ?? routes.find(( entry ) => !entry.types);

    return route ? fillPattern(route.path, { [route.parameter]: entityParam(item.id, item.slug) }) : null;

}
