import { read } from "@/api/workflow/server";
import { screenHref } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { screens } from "@/lib/spec/server";
import { instant } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { fillPattern } from "@/lib/std/route";
import { deals } from "./use-board";

export async function offerBand ( limit: number, source: "home" | "list" = "list" ) {

    const [locale, t, time] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("offers"), getTranslations("time")]);
    const page = screens.find(( screen ) => screen.name === "offers");
    const single = screens.find(( screen ) => screen.name === "offer");

    try {

        const feed = source === "home" ? await read("home", "offers", { limit: 20 }).catch(() => null) : null;
        const result = feed?.resource.length ? feed : await read("offers", "list", { limit: 20 });
        const now = Date.now();
        const live = result.resource
            .filter(( offer ) => !offer.expires_at || instant(offer.expires_at) > now)
            .sort(( a, b ) => (b.priority ?? 0) - (a.priority ?? 0));
        const lead = live[0];

        if ( !lead ) return null;

        const ids = new Set(live.map(( offer ) => offer.id));
        const picked = await deals(( id ) => id != null && ids.has(id), limit);
        const until = lead.expires_at ?? null;
        const left = until ? Math.max(0, Math.floor((instant(until) - now) / 86400000)) : null;

        return {
            title: lead.name ?? "",
            description: lead.description ?? "",
            ends: left === null ? null : t("endsIn", { days: left }),
            until,
            deals: picked.map(( item ) => ({
                key: item.card.key,
                title: item.card.title,
                href: item.card.href,
                image: item.card.image,
                variants: item.card.variants,
                price: item.card.price,
                off: item.card.badge,
                currencyLabel: item.currencyLabel,
            })),
            action: page ? { href: screenHref(page, locale) ?? "/", label: t("browse") } : undefined,
            terms: single ? {
                href: localePath(locale, fillPattern(single.path, { offerId: String(lead.id) }), routing), label: t("terms"),
            } : undefined,
            countdown: {
                label: t("endsSoon"), units: { days: time("days"), hours: time("hours"), minutes: time("minutes") }, start: now,
            },
            featured: t("featured"),
        };

    }
    catch {

        return null;

    }

}
