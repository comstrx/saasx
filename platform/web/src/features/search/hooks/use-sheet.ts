import { read } from "@/api/workflow/server";
import { verticals as listingsOf, screenHref } from "@/hooks/use-catalog";
import { productFields } from "@/hooks/use-product-card";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Locale } from "@/lib/spec/languages";
import { text } from "@/lib/spec/server";

type Spot = { id: string; label: string; detail: string | null; image: string | null; total: number };

const limit = 5;

export async function searchSheet ( target: string ) {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("header")]);
    const listings = listingsOf();
    const own = listings.find(( item ) => item.screen.path === target);
    const verticals = {
        label: t("verticals"),
        items: listings.map(( item ) => ({
            href: screenHref(item.screen, locale) ?? "/",
            label: text(item.screen.title, locale),
            icon: item.screen.icon ?? null,
            current: item.screen.path === target,
        })),
    };

    try {

        const scope = own ? { type: String(own.options.type) } : {};
        const result = await read("products", "list", { limit: 48, fields: productFields, ...scope });
        const spots = new Map<string, Spot>();

        for ( const row of result.resource ) {

            const city = row.geo?.city;

            if ( !city?.id || !city.name ) continue;

            const key = String(city.id);
            const spot = spots.get(key) ?? { id: key, label: city.name, detail: row.geo?.country?.name ?? null, image: null, total: 0 };

            spot.total += 1;
            spot.image ??= row.image ?? null;
            spots.set(key, spot);

        }

        const popular = [...spots.values()].sort(( a, b ) => b.total - a.total).slice(0, limit)
            .map(( spot ) => ({ id: spot.id, label: spot.label, detail: spot.detail, image: spot.image }));

        return { verticals, popular };

    }
    catch {

        return { verticals, popular: [] };

    }

}
