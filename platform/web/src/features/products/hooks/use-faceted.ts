import { facetedSearch } from "@/hooks/use-faceted-search";
import { getLocale } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Route, Screen } from "@/lib/spec/feature";
import { localePath } from "@/lib/std/locale";
import { entityId, fillPattern } from "@/lib/std/route";

type Options = {
    screen: Screen; route: Route; scope: string; limit: number; groups: readonly string[]; tabs: boolean; type: string; dates: string;
    noun: string; layout: "list" | "grid"; map: { tiles: string; credit: string };
};

const scopes = {
    geo: { parameter: "geoId", filter: "geo" },
    category: { parameter: "categoryId", filter: "category" },
    vendor: { parameter: "vendorId", filter: "vendor" },
} as const;

export async function faceted ( { screen, route, scope, limit, groups, tabs, type, dates, noun, layout, map }: Options ) {

    const locale = await getLocale();
    const base = localePath(locale, fillPattern(screen.path, route.parameters), routing);
    const rule = scopes[scope as keyof typeof scopes];
    const id = rule ? entityId(route.parameters[rule.parameter]) : undefined;

    return facetedSearch({
        route, base, scope: rule && id ? { [rule.filter]: id } : {}, limit, groups, tabs, matches: false,
        type: type || undefined, dates, noun: noun || undefined, layout, map,
    });

}
