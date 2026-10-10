import { read } from "@/api/workflow/server";
import { entityHref, screenArt, screenHref } from "@/hooks/use-catalog";
import { productCard, productFields, productLabels } from "@/hooks/use-product-card";
import { getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Route } from "@/lib/spec/feature";
import { screens, text } from "@/lib/spec/server";
import { localePath } from "@/lib/std/locale";
import { mapsLink, placeIcon, placeKind } from "@/lib/std/places";
import { entityId, entityParam, fillPattern } from "@/lib/std/route";

export async function place ( route: Route ) {

    const [t, labels] = await Promise.all([getTranslations("places"), productLabels()]);
    const { locale } = labels;
    const poiId = entityId(route.parameters.poiId);
    const index = screens.find(( screen ) => screen.name === "destinations");

    if ( !poiId ) return null;

    try {

        const [view, products, opinions] = await Promise.all([
            read("pois", "view", { poiId }),
            read("pois", "products", { poiId, limit: 8, fields: productFields }).then(( reply ) => reply.resource).catch(() => []),
            read("pois", "reviews", { poiId, limit: 1 }).then(( reply ) => reply.resource.length).catch(() => 0),
        ]);
        const row = view.resource;
        const lat = Number(row.latitude);
        const lng = Number(row.longitude);
        const located = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
        const [near, others] = await Promise.all([
            products.length || !located ? Promise.resolve([])
                : read("products", "list", { limit: 8, lat, lng, distance: 15, fields: productFields })
                    .then(( reply ) => reply.resource).catch(() => []),
            row.geo?.id ? read("pois", "list", { limit: 9, filters: { geo_id: row.geo.id } })
                .then(( reply ) => reply.resource.filter(( entry ) => entry.id !== poiId).slice(0, 8))
                .catch(() => []) : Promise.resolve([]),
        ]);
        const browse = screens.find(( screen ) => screen.name === "browse");
        const point = `${lat.toFixed(5)},${lng.toFixed(5)}`;
        const link = ( entry: { id: number; slug?: string | null } ) => entityParam(entry.id, entry.slug);
        const spot = screens.find(( screen ) => screen.name === "place");
        const known = placeKind(row.kind);
        const kind = known ? t(`kinds.${known}`) : row.kind?.replaceAll("_", " ") ?? null;
        const city = row.geo;

        return {
            id: poiId,
            title: row.name ?? "",
            art: screenArt([], "travel"),
            trail: {
                label: t("trail"),
                items: [
                    ...(index ? [{ label: text(index.title, locale), href: screenHref(index, locale) ?? undefined }] : []),
                    ...(city?.name ? [{
                        label: city.name, href: entityHref("geo", { id: city.id, slug: city.slug, type: city.type }, locale) ?? undefined,
                    }] : []),
                    { label: row.name ?? "" },
                ],
            },
            kind,
            icon: placeIcon(row.kind),
            location: city?.name ?? null,
            about: row.description || null,
            map: mapsLink(row.latitude, row.longitude),
            coordinates: row.latitude && row.longitude ? `${Number(row.latitude).toFixed(5)}, ${Number(row.longitude).toFixed(5)}` : null,
            nearby: near.map(( item ) => ({
                card: productCard(item, { locale, href: entityHref("product", item, locale), badges: true, labels: labels.card }),
                currencyLabel: labels.view.currency(item.currency ?? "USD"),
            })),
            nearbyHref: browse && located ? `${screenHref(browse, locale) ?? ""}?${new URLSearchParams({ near: point })}` : null,
            places: others.map(( entry ) => {

                const sort = placeKind(entry.kind);

                return {
                    key: String(entry.id),
                    title: entry.name ?? "",
                    description: sort ? t(`kinds.${sort}`) : entry.kind?.replaceAll("_", " ") ?? undefined,
                    icon: placeIcon(entry.kind),
                    href: spot ? localePath(locale, fillPattern(spot.path, { poiId: link(entry) }), routing) : null,
                };

            }),
            products: products.map(( item ) => ({
                card: productCard(item, { locale, href: entityHref("product", item, locale), badges: true, labels: labels.card }),
                currencyLabel: labels.view.currency(item.currency ?? "USD"),
            })),
            reviews: opinions > 0,
            labels: {
                about: t("about"), map: t("map"), open: t("open"), coordinates: t("coordinates"),
                products: t("products", { name: row.name ?? "" }),
                nearby: t("nearbyStays", { name: row.name ?? "" }), all: t("seeAllNearby"),
                places: t("morePlaces", { name: row.geo?.name ?? row.name ?? "" }),
                reviews: t("reviews"), noReviews: t("noReviews"),
            },
        };

    }
    catch {

        return null;

    }

}
