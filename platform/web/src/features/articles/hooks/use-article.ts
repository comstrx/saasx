import { read } from "@/api/workflow/server";
import { entityHref, screenHref } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Route } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { screens, text } from "@/lib/spec/server";
import { count, day } from "@/lib/std/format";
import { entityId } from "@/lib/std/route";
import { minutes } from "./use-archive";

export async function article ( route: Route ) {

    const [locale, t, detail, common] = await Promise.all([
        getLocale() as Promise<Locale>, getTranslations("articles"), getTranslations("detail"), getTranslations("common"),
    ]);
    const articleId = entityId(route.parameters.articleId);
    const index = screens.find(( screen ) => screen.name === "blog");

    if ( !articleId ) return null;

    try {

        const [view, latest] = await Promise.all([
            read("articles", "view", { articleId }),
            read("articles", "list", { limit: 4, sort: "newest" }).then(( reply ) => reply.resource).catch(() => []),
        ]);
        const row = view.resource;
        const pictures = (row.attachments ?? []).filter(( file ) => file.type === "image" && file.url).map(( file, position, list ) => ({
            src: file.url ?? "", alt: file.name ?? row.title ?? "",
            label: detail("photoPosition", { current: position + 1, total: list.length }),
        }));

        return {
            id: articleId,
            title: row.title ?? "",
            description: row.description ?? null,
            image: row.image ?? null,
            content: row.content ?? "",
            trail: {
                label: t("trail"),
                items: [
                    ...(index ? [{ label: text(index.title, locale), href: screenHref(index, locale) ?? undefined }] : []),
                    { label: row.title ?? "" },
                ],
            },
            facts: [
                row.created_at ? day(row.created_at, locale, { day: "numeric", month: "long", year: "numeric" }) : null,
                t("reading", { count: minutes(row.content) }),
                t("comments", { count: row.comments ?? 0 }),
            ].filter(( value ): value is string => Boolean(value)),
            pictures,
            likes: row.likes ?? 0,
            dislikes: row.dislikes ?? 0,
            favorite: row.in_favorites === true,
            related: latest.filter(( item ) => item.id !== articleId).slice(0, 3).map(( item ) => ({
                key: String(item.id),
                title: item.title ?? "",
                description: item.description ?? null,
                image: item.image ?? null,
                date: item.created_at ? day(item.created_at, locale) : null,
                comments: t("comments", { count: item.comments ?? 0 }),
                href: entityHref("article", { id: item.id, slug: item.slug }, locale),
            })),
            labels: {
                related: t("related"), gallery: {
                    title: t("photos", { name: row.title ?? "" }), show: detail("photos"), close: detail("close"),
                    previous: common("previous"), next: common("next"),
                },
                share: { label: t("share"), copied: t("copied"), failed: t("shareFailed") },
                discussion: t("discussion"),
                views: row.views ? t("views", { count: row.views, formatted: count(row.views, locale) }) : null,
            },
            direction: locale === "ar" ? "rtl" as const : "ltr" as const,
        };

    }
    catch {

        return null;

    }

}
