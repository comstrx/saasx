import { read } from "@/api/workflow/server";
import { entityHref, screenHref } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Locale } from "@/lib/spec/languages";
import { screens } from "@/lib/spec/server";
import { day } from "@/lib/std/format";

export async function latestArticles ( limit: number ) {

    const [locale, t, common] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("articles"), getTranslations("common")]);
    const page = screens.find(( screen ) => screen.name === "blog");

    try {

        const result = await read("articles", "list", { limit, sort: "newest" });

        return {
            items: result.resource.map(( article ) => ({
                key: String(article.id),
                title: article.title ?? "",
                description: article.description ?? null,
                image: article.image ?? null,
                date: article.created_at ? day(article.created_at, locale) : null,
                comments: t("comments", { count: article.comments ?? 0 }),
                href: entityHref("article", { id: article.id, slug: article.slug }, locale),
            })),
            action: page ? { href: screenHref(page, locale) ?? "/", label: common("seeAll") } : undefined,
        };

    }
    catch {

        return null;

    }

}
