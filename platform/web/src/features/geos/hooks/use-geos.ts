import { read } from "@/api/workflow/server";
import { entityHref, screenHref } from "@/hooks/use-catalog";
import { productFields } from "@/hooks/use-product-card";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Locale } from "@/lib/spec/languages";
import { screens } from "@/lib/spec/server";
import { count } from "@/lib/std/format";

type Spot = { id: number; name: string; slug: string | null; country: string; image: string | null; variants: unknown; total: number };

export async function trending ( limit: number ) {

    const [locale, t, common] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("discover"), getTranslations("common")]);
    const page = screens.find(( screen ) => screen.name === "destinations");

    try {

        const result = await read("products", "list", { limit: 48, fields: productFields });
        const spots = new Map<number, Spot>();

        for ( const row of result.resource ) {

            const city = row.geo?.city;

            if ( !city?.id || !city.name ) continue;

            const spot = spots.get(city.id) ?? {
                id: city.id,
                name: city.name,
                slug: city.slug ?? null,
                country: row.geo?.country?.name ?? "",
                image: null,
                variants: null,
                total: 0,
            };

            spot.total += 1;

            if ( !spot.image && row.image ) {

                spot.image = row.image;
                spot.variants = row.image_variants;

            }

            spots.set(city.id, spot);

        }

        const items = [...spots.values()].filter(( spot ) => spot.image).sort(( a, b ) => b.total - a.total).slice(0, limit);

        return {
            items: items.map(( spot ) => ({
                key: String(spot.id),
                title: spot.name,
                subtitle: spot.country,
                count: t("count", { count: spot.total, formatted: count(spot.total, locale) }),
                image: spot.image,
                variants: spot.variants as Record<string, string | null> | null,
                href: entityHref("geo", { id: spot.id, slug: spot.slug, type: "city" }, locale),
            })),
            action: page ? { href: screenHref(page, locale) ?? "/", label: common("seeAll") } : undefined,
        };

    }
    catch {

        return null;

    }

}
