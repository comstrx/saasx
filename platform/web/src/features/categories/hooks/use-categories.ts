import { read } from "@/api/workflow/server";
import { catalogScreen, entityHref, screenHref } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Locale } from "@/lib/spec/languages";
import { screens } from "@/lib/spec/server";
import { count } from "@/lib/std/format";

export async function popular ( limit: number, source: "home" | "list" = "list" ) {

    const [locale, t, common] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("discover"), getTranslations("common")]);
    const page = screens.find(( screen ) => screen.name === "categories");

    try {

        const feed = source === "home" ? await read("home", "categories", { limit }).catch(() => null) : null;
        const result = feed?.resource.length ? feed : await read("categories", "list", { limit, sort: "highest_ordered" });

        return {
            items: result.resource.map(( category ) => {

                const total = category.catalogs ?? 0;

                return {
                    key: String(category.id),
                    title: category.name,
                    description: total > 0
                        ? t("count", { count: total, formatted: count(total, locale) })
                        : category.description ?? undefined,
                    icon: catalogScreen(category.icon)?.icon ?? category.icon ?? "compass",
                    href: entityHref("category", { id: category.id, slug: category.slug }, locale),
                };

            }),
            action: page ? { href: screenHref(page, locale) ?? "/", label: common("seeAll") } : undefined,
        };

    }
    catch {

        return null;

    }

}
