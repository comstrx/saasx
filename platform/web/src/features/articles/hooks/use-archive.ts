import { read } from "@/api/workflow/server";
import { entityHref } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Route, Screen } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { count, day } from "@/lib/std/format";
import { queryHref, queryNumber } from "@/lib/std/listing";
import { localePath } from "@/lib/std/locale";

const size = 9;

export function minutes ( html: string | null | undefined ): number {

    const words = (html ?? "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

    return Math.max(1, Math.round(words / 220));

}
export async function archive ( screen: Screen, route: Route ) {

    const [locale, t, common] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("articles"), getTranslations("common")]);
    const page = queryNumber(route.query, "page", 1, 1000) ?? 1;
    const base = localePath(locale, screen.path, routing);

    try {

        const result = await read("articles", "list", { page, limit: size, sort: "newest" });
        const items = result.resource.map(( article ) => ({
            key: String(article.id),
            title: article.title ?? "",
            description: article.description ?? null,
            image: article.image ?? null,
            date: article.created_at ? day(article.created_at, locale) : null,
            comments: t("comments", { count: article.comments ?? 0 }),
            reading: t("reading", { count: minutes(article.content) }),
            href: entityHref("article", { id: article.id, slug: article.slug }, locale),
        }));
        const pages = result.meta.pagination?.pages;
        const next = pages != null ? page < pages : items.length === size;

        return {
            lead: page === 1 ? items[0] ?? null : null,
            items: page === 1 ? items.slice(1) : items,
            empty: { title: t("archiveEmptyTitle"), body: t("archiveEmptyBody") },
            more: t("latest"),
            pager: {
                label: t("page", { page: count(page, locale) }),
                previous: page > 1 ? { label: common("previous"), href: queryHref(base, route.query, { page: String(page - 1) }) } : null,
                next: next ? { label: common("next"), href: queryHref(base, route.query, { page: String(page + 1) }) } : null,
            },
        };

    }
    catch {

        return null;

    }

}
