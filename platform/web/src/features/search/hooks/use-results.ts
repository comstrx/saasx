import { facetedSearch } from "@/hooks/use-faceted-search";
import { getLocale } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Route, Screen } from "@/lib/spec/feature";
import { localePath } from "@/lib/std/locale";
import { fillPattern } from "@/lib/std/route";

type Options = {
    screen: Screen; route: Route; limit: number; groups: readonly string[]; tabs: boolean;
    map: { tiles: string; credit: string };
};

export async function searchResults ( { screen, route, limit, groups, tabs, map }: Options ) {

    const locale = await getLocale();
    const base = localePath(locale, fillPattern(screen.path, route.parameters), routing);

    return facetedSearch({ route, base, scope: {}, limit, groups, tabs, matches: true, map });

}
