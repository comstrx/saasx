import { read } from "@/api/workflow/server";
import { entityHref, screenArt, screenHref, serverIcon, verticals } from "@/hooks/use-catalog";
import { productFields } from "@/hooks/use-product-card";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Route } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { screens, text } from "@/lib/spec/server";
import { count, money } from "@/lib/std/format";
import { queryHref } from "@/lib/std/listing";
import { localePath } from "@/lib/std/locale";
import { mapsLink, placeIcon, placeKind } from "@/lib/std/places";
import { entityId, entityParam, fillPattern } from "@/lib/std/route";

type Place = { id: number; name?: string | null; slug?: string | null; type?: string | null; catalogs_count?: number | null };
type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Shot = { image?: string | null; name?: string | null };
type Attraction = {
    id?: number; name?: string | null; slug?: string | null; kind?: string | null; latitude?: string | null; longitude?: string | null;
};

async function sample ( filter: { country?: number; geo?: number }, limit: number ): Promise<Shot[]> {

    try {

        const result = await read("products", "list", { ...filter, limit, fields: productFields });

        return result.resource.filter(( row ) => row.image).map(( row ) => ({ image: row.image, name: row.name }));

    }
    catch {

        return [];

    }

}
function busiest ( places: readonly Place[] | null | undefined, limit: number ) {

    return [...(places ?? [])].filter(( place ) => (place.catalogs_count ?? 0) > 0)
        .sort(( a, b ) => (b.catalogs_count ?? 0) - (a.catalogs_count ?? 0)).slice(0, limit);

}
export async function atlas () {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("atlas")]);

    try {

        const root = await read("geos", "atlas", {});
        const countries = busiest(root.resource.children, 12);
        const cards = await Promise.all(countries.map(async ( country ) => {

            const [explore, shots] = await Promise.all([
                read("geos", "explore", { geoId: country.id }).then(( reply ) => reply.resource).catch(() => null),
                sample({ country: country.id }, 4),
            ]);
            const total = country.catalogs_count ?? 0;

            return {
                key: String(country.id),
                title: country.name ?? "",
                code: (country as Place & { code?: string | null }).code ?? null,
                count: t("places", { count: total, formatted: count(total, locale) }),
                image: shots[0]?.image ?? null,
                href: entityHref("geo", { id: country.id, slug: country.slug, type: country.type }, locale),
                regions: busiest(explore?.children, 6).map(( region ) => ({
                    key: String(region.id),
                    label: region.name ?? "",
                    href: entityHref("geo", { id: region.id, slug: region.slug, type: region.type }, locale),
                })),
            };

        }));

        return { label: t("countries"), items: cards };

    }
    catch {

        return null;

    }

}

type Scope = "country" | "region" | "city" | "district";

function scopeOf ( type: string | null | undefined ): Scope | null {

    return type === "country" || type === "region" || type === "city" || type === "district" ? type : null;

}
async function opinions ( scope: Scope | null, id: number ): Promise<number> {

    const asked = { limit: 1 } as const;
    const reply = scope === "country" ? read("countries", "reviews", { countryId: id, ...asked })
        : scope === "region" ? read("regions", "reviews", { regionId: id, ...asked })
        : scope === "city" ? read("cities", "reviews", { cityId: id, ...asked })
        : scope === "district" ? read("districts", "reviews", { districtId: id, ...asked }) : null;

    return reply ? reply.then(( found ) => found.resource.length).catch(() => 0) : 0;

}
async function nested ( scope: Scope | null, id: number ) {

    const asked = { limit: 12, filters: { destination: true } };
    const reply = scope === "country" ? read("countries", "cities", { countryId: id, ...asked })
        : scope === "region" ? read("regions", "cities", { regionId: id, ...asked })
        : scope === "city" ? read("cities", "districts", { cityId: id, ...asked }) : null;

    const found = reply ?? read("geos", "children", { geoId: id, ...asked });

    return found.then(( rows ) => rows.resource).catch(() => []);

}
export async function destination ( route: Route ) {

    const [locale, t, common, detail, places] = await Promise.all([
        getLocale() as Promise<Locale>, getTranslations("atlas"), getTranslations("common"), getTranslations("detail"),
        getTranslations("places"),
    ]);
    const spot = screens.find(( screen ) => screen.name === "place");
    const geoId = entityId(route.parameters.geoId);

    if ( !geoId ) return null;

    try {

        const [view, explore, shots] = await Promise.all([
            read("geos", "view", { geoId }),
            read("geos", "explore", { geoId }).then(( reply ) => reply.resource).catch(() => null),
            sample({ geo: geoId }, 12),
        ]);
        const place = view.resource;
        const scope = scopeOf(place.type);
        const [reviewed, inner, counted, grouped] = await Promise.all([
            opinions(scope, geoId),
            nested(scope, geoId),
            explore?.facets ? null : read("geos", "stats", { geoId }).then(( reply ) => reply.resource.stats).catch(() => null),
            read("geos", "categories", { geoId, limit: 12, sort: "highest_ordered" }).then(( reply ) => reply.resource).catch(() => []),
        ]);
        const facets = explore?.facets ?? counted;
        const types: Record<string, number> = facets?.types && !Array.isArray(facets.types) ? facets.types : {};
        const total = place.catalogs ?? Object.values(types).reduce(( sum, value ) => sum + value, 0);
        const from = money(facets?.price_from, locale, "USD", true);
        const index = screens.find(( screen ) => screen.name === "destinations");
        const name = place.name ?? "";
        const categories = (facets?.categories ?? []) as readonly { category_id?: number; count?: number; name?: string | null }[];
        const listed = ((explore?.attractions ?? []) as readonly Attraction[]).filter(( row ) => row.id && row.name).slice(0, 8);
        const regionCount = explore?.children?.length || inner.length;
        const attractions = listed.map(( row ) => {

            const known = placeKind(row.kind);
            const poiId = entityParam(row.id ?? 0, row.slug);

            return {
                key: String(row.id),
                title: row.name ?? "",
                description: known ? places(`kinds.${known}`) : row.kind?.replaceAll("_", " ") ?? undefined,
                icon: placeIcon(row.kind),
                href: spot ? localePath(locale, fillPattern(spot.path, { poiId }), routing) : mapsLink(row.latitude, row.longitude),
            };

        });

        return {
            id: geoId,
            reviews: scope && reviewed > 0 ? scope : null,
            name,
            art: screenArt([index?.name], "travel"),
            trail: {
                label: t("trail"),
                items: [
                    ...(index ? [{ label: text(index.title, locale), href: screenHref(index, locale) ?? undefined }] : []),
                    ...(place.breadcrumb ?? []).filter(( crumb ) => crumb.id !== place.id).map(( crumb ) => ({
                        label: crumb.name ?? "",
                        href: entityHref("geo", { id: crumb.id, slug: crumb.slug, type: crumb.type }, locale) ?? undefined,
                    })),
                    { label: name },
                ],
            },
            kind: place.type ? t(`kinds.${place.type === "country" || place.type === "region" ? place.type : "city"}`) : null,
            facts: [
                total ? t("places", { count: total, formatted: count(total, locale) }) : null,
                from ? t("from", { price: from.before ? `${from.currency} ${from.number}` : `${from.number} ${from.currency}` }) : null,
            ].filter(( value ): value is string => Boolean(value)),
            about: place.about || place.overview || place.description || null,
            pictures: shots.slice(0, 7).map(( shot, position, list ) => ({
                src: shot.image ?? "", alt: shot.name ?? name,
                label: detail("photoPosition", { current: position + 1, total: list.length }),
            })),
            verticals: verticals()
                .flatMap(( item ) => {

                    const amount = types[String(item.options.type)] ?? 0;
                    const href = screenHref(item.screen, locale);

                    return amount > 0 && href ? [{
                        href: queryHref(href, {}, { geo: String(geoId), where: name }),
                        label: text(item.screen.title, locale),
                        description: text(item.screen.description, locale),
                        art: screenArt([item.screen.name], "discovery"),
                        count: t("options", { count: amount, formatted: count(amount, locale) }),
                    }] : [];

                }),
            stats: {
                label: t("glance"),
                items: [
                    {
                        key: "listings", label: t("stats.listings"), value: total ? count(total, locale) : null, icon: "grid",
                        tone: "teal",
                    },
                    {
                        key: "from", label: t("stats.from"), icon: "tag", tone: "ember",
                        value: from ? from.before ? `${from.currency} ${from.number}` : `${from.number} ${from.currency}` : null,
                    },
                    {
                        key: "sections", label: t("stats.sections"), icon: "compass", tone: "blue",
                        value: Object.keys(types).length ? count(Object.keys(types).length, locale) : null,
                    },
                    {
                        key: "categories", label: t("stats.categories"), icon: "folder", tone: "green",
                        value: categories.length ? count(categories.length, locale) : null,
                    },
                    {
                        key: "places", label: t("stats.places"), icon: "pin", tone: "amber",
                        value: regionCount ? count(regionCount, locale) : null,
                    },
                    {
                        key: "sights", label: t("stats.sights"), icon: "map", tone: "red",
                        value: listed.length ? count(listed.length, locale) : null,
                    },
                ].flatMap(( item ) => (item.value ? [{ ...item, value: item.value, tone: item.tone as Tone }] : [])),
            },
            categories: grouped.length ? grouped.map(( row ) => ({
                key: String(row.id),
                title: row.name,
                description: row.catalogs ? t("options", { count: row.catalogs, formatted: count(row.catalogs, locale) }) : undefined,
                icon: serverIcon(row.icon),
                href: entityHref("category", { id: row.id, slug: row.slug }, locale),
            })) : categories.flatMap(( row ) => row.category_id ? [{
                key: String(row.category_id),
                title: row.name ?? "",
                description: t("options", { count: row.count ?? 0, formatted: count(row.count ?? 0, locale) }),
                icon: "compass",
                href: entityHref("category", { id: row.category_id }, locale),
            }] : []),
            attractions,
            places: inner.filter(( row ) => !(explore?.children ?? []).some(( child ) => child.id === row.id)).map(( row ) => ({
                key: String(row.id),
                title: row.name ?? "",
                description: row.catalogs ? t("places", { count: row.catalogs, formatted: count(row.catalogs, locale) }) : undefined,
                icon: scope === "city" ? "house-line" : "buildings",
                href: entityHref("geo", { id: row.id, slug: row.slug, type: row.type }, locale),
            })),
            regions: busiest(explore?.children, 12).map(( region ) => ({
                key: String(region.id),
                title: region.name ?? "",
                description: t("places", { count: region.catalogs_count ?? 0, formatted: count(region.catalogs_count ?? 0, locale) }),
                icon: "pin",
                href: entityHref("geo", { id: region.id, slug: region.slug, type: region.type }, locale),
            })),
            labels: {
                verticals: t("verticals", { name }), categories: t("categories", { name }), regions: t("regions", { name }),
                around: places("around", { name }),
                reviews: t("reviews", { name }), noReviews: t("noReviews"),
                places: t(scope === "city" ? "districts" : "cities", { name }),
                about: t("about", { name }),
                gallery: {
                    title: t("gallery", { name }), show: detail("photos"), close: detail("close"),
                    previous: common("previous"), next: common("next"),
                },
            },
            direction: locale === "ar" ? "rtl" as const : "ltr" as const,
        };

    }
    catch {

        return null;

    }

}
