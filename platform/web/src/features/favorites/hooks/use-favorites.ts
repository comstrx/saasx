"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { favoriteInput, favoriteKinds, favoriteSorts } from "@/lib/std/favorites";
import { queryHref } from "@/lib/std/listing";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

export function useFavorites ( options: { login: string; browse: string; limit: number } ) {

    const t = useTranslations("favorites");
    const common = useTranslations("common");
    const locale = useLocale();
    const path = usePathname();
    const search = useSearchParams();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const user = useUi(( state ) => state.user);
    const query = Object.fromEntries(search.entries());
    const input = favoriteInput(query, options.limit);
    const allowed = user?.permissions?.includes("view_favorites") === true;
    const request = useRead("favorites", "list", input, { enabled: ready && !!token && allowed });
    const items = request.data ?? [];
    const pages = request.meta?.pagination?.pages;
    const total = request.meta?.pagination?.total;
    const next = pages != null ? input.page < pages : items.length === input.limit;
    const kind = input.filters?.related ?? "all";

    return {
        t, common, request, items, ready, token, page: input.page, kind,
        empty: ready && !request.loading && !request.error && !items.length,
        denied: ready && !!token && !allowed || request.error?.status === 403,
        expired: request.error?.status === 401,
        login: `${localePath(locale, options.login, routing)}?${new URLSearchParams({ next: `${path}?${search}` })}`,
        browse: localePath(locale, options.browse, routing),
        first: queryHref(path, query, { page: null }), clear: path,
        count: total == null ? t("list") : t("results", { count: total }),
        controls: {
            groups: favoriteKinds.map(( value ) => ({
                label: t(`groups.${value}`), current: kind === value,
                href: queryHref(path, query, { kind: value === "all" ? null : value }),
            })),
            sort: {
                label: t(`sorts.${input.sort}`),
                choices: favoriteSorts.map(( value ) => ({
                    key: value, label: t(`sorts.${value}`), href: queryHref(path, query, { sort: value }), current: input.sort === value,
                })),
            },
        },
        pager: {
            label: t("page", { page: input.page }),
            previous: input.page > 1 ? {
                label: common("previous"), href: queryHref(path, query, { page: String(input.page - 1) }),
            } : null,
            next: next ? { label: common("next"), href: queryHref(path, query, { page: String(input.page + 1) }) } : null,
        },
    };

}
