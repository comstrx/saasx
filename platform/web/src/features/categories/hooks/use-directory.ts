import { read } from "@/api/workflow/server";
import { catalogScreen, entityHref } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Locale } from "@/lib/spec/languages";
import { text } from "@/lib/spec/server";
import { count } from "@/lib/std/format";

type Item = { key: string; title: string; description?: string; icon: string; href: string | null };
type Group = { key: string; title: string; icon: string; items: Item[] };

export async function directory () {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("directory")]);

    try {

        const result = await read("categories", "list", { limit: 100, sort: "highest_ordered" });
        const groups = new Map<string, Group>();

        for ( const category of result.resource ) {

            const screen = catalogScreen(category.icon);
            const key = screen?.name ?? "other";
            const group = groups.get(key) ?? {
                key, title: screen ? text(screen.title, locale) : t("more"), icon: screen?.icon ?? "compass", items: [],
            };
            const total = category.catalogs ?? 0;
            const place = category.geo?.geo?.name ?? category.geo?.country?.name;

            group.items.push({
                key: String(category.id),
                title: category.name ?? "",
                description: total > 0 && place ? t("countIn", { count: total, formatted: count(total, locale), place })
                    : total > 0 ? t("count", { count: total, formatted: count(total, locale) }) : category.description ?? undefined,
                icon: screen?.icon ?? "compass",
                href: entityHref("category", { id: category.id, slug: category.slug }, locale),
            });
            groups.set(key, group);

        }

        return [...groups.values()].sort(( a, b ) => (a.key === "other" ? 1 : b.key === "other" ? -1 : b.items.length - a.items.length));

    }
    catch {

        return null;

    }

}
