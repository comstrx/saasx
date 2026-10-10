import { failureReference } from "@/api/core/error";
import { read, siteCurrency } from "@/api/workflow/server";
import { catalogScreen, entityHref } from "@/hooks/use-catalog";
import { perks, popularity, productCard, productFields, productLabels } from "@/hooks/use-product-card";
import { createTranslator, getTranslations } from "@/lib/providers/intl-server";
import type { Route } from "@/lib/spec/feature";
import { text as specText } from "@/lib/spec/server";
import { count, decimal, hasGlyph } from "@/lib/std/format";
import { placePoint } from "@/lib/std/geo";
import {
    catalogSorts, listingInput, priceBuckets, priceEdges, queryHref, queryList, queryNumber, queryText, toggled,
} from "@/lib/std/listing";
import { plainText } from "@/lib/std/text";

type Group = "category" | "format" | "rating" | "price" | "place" | "stars";
type Options = {
    route: Route;
    base: string;
    scope: Readonly<Record<string, number | string>>;
    limit: number;
    groups: readonly string[];
    tabs: boolean;
    matches: boolean;
    type?: string;
    dates?: string;
    noun?: string;
    layout?: "list" | "grid";
    map?: { tiles: string; credit: string } | null;
};
type Changes = Record<string, string | null>;
type View = "list" | "grid" | "map";
type Option = { key: string; label: string; count: string | null; href: string; checked: boolean; icon?: string | null };

const formats = ["online", "offline", "physical", "digital", "individual", "collective"] as const;
const ratings = ["4.5", "4", "3.5", "3"] as const;
const classes = ["5", "4", "3"] as const;
const formatIcons = {
    online: "globe", offline: "pin", physical: "package", digital: "lightning", individual: "user", collective: "users",
} as const;
const entityIcons = { geo: "pin", category: "grid" } as const;
const probe = { limit: 1, fields: ["id", "name", "type"] };

function isFormat ( value: string ): value is (typeof formats)[number] {

    return (formats as readonly string[]).includes(value);

}
function amount ( query: Route["query"], key: string ): string | undefined {

    const value = queryText(query, key);

    return value && /^\d{1,12}(?:\.\d{1,6})?$/.test(value) ? value : undefined;

}
function tally ( facet: Readonly<Record<string, number>> | undefined, at: number ): number {

    return Object.entries(facet ?? {}).reduce(( sum, [key, value] ) => (Number(key) >= at ? sum + value : sum), 0);

}
export async function facetedSearch ( {
    route, base, scope, limit, groups, tabs, matches, type, dates = "none", noun, layout = "list", map = null,
}: Options ) {

    const [t, list, common, labels, currency] = await Promise.all([
        getTranslations("facets"), getTranslations("listing"), getTranslations("common"), productLabels(), siteCurrency(),
    ]);
    const { locale } = labels;
    const query = route.query;
    const text = queryText(query, "query");
    const types = queryList(query, "type");
    const categories = queryList(query, "category").filter(( value ) => /^\d{1,12}$/.test(value));
    const chosen = queryList(query, "format").filter(isFormat);
    const rating = queryNumber(query, "rating", 1, 5, .5);
    const geo = queryNumber(query, "geo", 1, Number.MAX_SAFE_INTEGER);
    const where = queryText(query, "where");
    const minPrice = amount(query, "minPrice");
    const maxPrice = amount(query, "maxPrice");
    const picked = queryText(query, "sort");
    const sort = catalogSorts.find(( key ) => key === picked && (key !== "relevance" || text)) ?? (text ? "relevance" : "recommended");
    const page = queryNumber(query, "page", 1, 10000) ?? 1;
    const asked = queryText(query, "view");
    const view: View = asked === "grid" || asked === "list" || (asked === "map" && map) ? asked : layout;
    const stars = queryNumber(query, "stars", 1, 5);
    const stay = listingInput(query, type ?? "", dates, limit);
    const window = {
        ...(stay.checkin ? { checkin: stay.checkin, checkout: stay.checkout } : {}),
        ...(stay.startsFrom ? { starts_from: stay.startsFrom, starts_to: stay.startsTo } : {}),
        ...(stay.adults ? { adults: stay.adults } : {}),
        ...(stay.children ? { children: stay.children } : {}),
    };
    const wanted = new Set(groups as readonly Group[]);
    const narrow = {
        ...scope,
        ...(type ? { type } : types.length ? { type: types } : {}),
        ...(stars ? { min_stars: stars } : {}),
        ...window,
        ...(categories.length ? { category: categories } : {}),
        ...(chosen.length ? { subtype: chosen } : {}),
        ...(rating ? { min_rating: rating } : {}),
        ...(geo ? { geo } : {}),
    };
    const filters = { ...narrow, ...(minPrice ? { min_price: minPrice } : {}), ...(maxPrice ? { max_price: maxPrice } : {}) };
    const searched = text ? { query: text } : {};
    const href = ( changes: Record<string, string | null> ) => queryHref(base, query, { ...changes, page: null });

    try {

        const [result, bounds, found] = await Promise.all([
            read("products", "list", {
                limit, page, sort, ...searched, filters,
                fields: [...productFields, "description"],
                facets: ["type", "category", "subtype", "rating"],
            }),
            wanted.has("price") ? read("products", "list", { ...probe, ...searched, filters: narrow, stats: ["min_price"] }) : null,
            matches && text ? read("search", "list", { query: text, limit: 12 }).catch(() => null) : null,
        ]);
        const facets = result.meta.aggregates?.facets ?? {};
        const spread = bounds?.meta.aggregates?.stats?.min_price;
        const low = Number(spread?.min);
        const high = Number(spread?.max);
        const edges = Number.isFinite(low) && Number.isFinite(high) && high > low ? priceEdges(low, high) : null;
        const ids = [...new Set([...categories, ...Object.keys(facets.category_id ?? {}).filter(Boolean)])].slice(0, 40).map(Number);
        const [histogram, named] = await Promise.all([
            edges ? read("products", "list", {
                ...probe, ...searched, filters: narrow, facets: ["min_price"], ranges: { min_price: edges.join(",") },
            }).catch(() => null) : null,
            wanted.has("category") && ids.length ? read("categories", "list", { ids, limit: 100, view: "tiny" }).catch(() => null) : null,
        ]);
        const total = result.meta.pagination?.total ?? null;
        const pages = result.meta.pagination?.pages;
        const popular = popularity(result.resource);
        const intent = { from: query.from, to: query.to, adults: query.adults, children: query.children };
        const items = result.resource.map(( row ) => {

            const path = entityHref("product", row, locale);
            const screen = catalogScreen(row.type);

            return {
                card: productCard(row, {
                    locale, href: path ? queryHref(path, intent, {}) : null, badges: true, labels: labels.card, popular,
                }),
                currencyLabel: labels.view.currency(row.currency ?? "USD"),
                kind: screen ? { label: specText(screen.label ?? screen.title, locale), icon: screen.icon ?? null } : null,
                summary: plainText(row.description).slice(0, 220) || null,
                perks: perks(row, labels.card),
                point: placePoint(row.geo),
            };

        });
        const typeCounts = facets.type ?? {};
        const sections = Object.entries(typeCounts).flatMap(( [key, value] ) => {

            const screen = catalogScreen(key);

            return screen && value > 0 ? [{
                key,
                label: specText(screen.label ?? screen.title, locale),
                icon: screen.icon ?? null,
                count: count(value, locale),
                href: href({ type: key }),
                current: types.length === 1 && types[0] === key,
            }] : [];

        });
        const everything = Object.values(typeCounts).reduce(( sum, value ) => sum + value, 0);
        const names = new Map((named?.resource ?? []).map(( row ) => [String(row.id), row.name]));
        const option = ( value: Omit<Option, "count"> & { count?: number } ): Option => ({
            ...value, count: value.count == null ? null : count(value.count, locale),
        });
        const side = [
            wanted.has("category") && names.size ? {
                key: "category",
                title: t("category"),
                shape: "check" as const,
                options: [...names].map(( [key, name] ) => option({
                    key, label: name, count: facets.category_id?.[key], icon: "grid",
                    href: href({ category: toggled(categories, key) }), checked: categories.includes(key),
                })).sort(( a, b ) => Number(b.checked) - Number(a.checked)),
            } : null,
            wanted.has("format") ? {
                key: "format",
                title: t("format"),
                shape: "check" as const,
                options: formats.flatMap(( key ) => (facets.subtype?.[key] || chosen.includes(key) ? [option({
                    key, label: t(`formats.${key}`), count: facets.subtype?.[key], icon: formatIcons[key],
                    href: href({ format: toggled(chosen, key) }), checked: chosen.includes(key),
                })] : [])),
            } : null,
            wanted.has("rating") ? {
                key: "rating",
                title: t("rating"),
                shape: "radio" as const,
                options: [
                    option({ key: "any", label: t("ratingAny"), href: href({ rating: null }), checked: !rating }),
                    ...ratings.map(( value ) => option({
                        key: value, label: t("ratingFrom", { value: decimal(value, locale) ?? value }), icon: "star",
                        count: tally(facets.rating, Number(value)), href: href({ rating: value }), checked: rating === Number(value),
                    })),
                ],
            } : null,
            wanted.has("stars") ? {
                key: "stars",
                title: t("stars"),
                shape: "radio" as const,
                options: [
                    option({ key: "any", label: t("starsAny"), href: href({ stars: null }), checked: !stars }),
                    ...classes.map(( value ) => option({
                        key: value, label: t("starsFrom", { value: Number(value) }), icon: "star",
                        href: href({ stars: value }), checked: stars === Number(value),
                    })),
                ],
            } : null,
        ].flatMap(( group ) => (group && group.options.length > (group.key === "rating" || group.key === "stars" ? 1 : 0) ? [group] : []))
            .sort(( a, b ) => groups.indexOf(a.key) - groups.indexOf(b.key));
        const floor = edges?.[0] ?? 0;
        const ceiling = edges?.[edges.length - 1] ?? 0;
        const from = minPrice ? Number(minPrice) : floor;
        const to = maxPrice ? Number(maxPrice) : ceiling;
        const counts = edges ? priceBuckets(histogram?.meta.aggregates?.facets?.min_price ?? {}, edges) : [];
        const hits = (found?.resource ?? []).flatMap(( row ) => {

            if ( row.entity !== "geo" && row.entity !== "category" ) return [];

            const link = entityHref(row.entity, row, locale);
            const label = "name" in row ? row.name : null;

            return link && label ? [{ key: `${row.entity}-${row.id}`, href: link, label, icon: entityIcons[row.entity] }] : [];

        }).slice(0, 8);
        const proposals: ({ key: string; label: string; changes: Changes } | null)[] = [
            text ? { key: "query", label: list("query", { text }), changes: { query: null, sort: null } } : null,
            ...types.flatMap(( key ) => {

                const label = sections.find(( entry ) => entry.key === key)?.label;

                return label ? [{ key: `type-${key}`, label, changes: { type: toggled(types, key) } }] : [];

            }),
            ...categories.map(( key ) => ({
                key: `category-${key}`, label: names.get(key) ?? t("category"), changes: { category: toggled(categories, key) },
            })),
            ...chosen.map(( key ) => ({ key: `format-${key}`, label: t(`formats.${key}`), changes: { format: toggled(chosen, key) } })),
            rating ? {
                key: "rating", label: t("ratingFrom", { value: decimal(rating, locale) ?? String(rating) }), changes: { rating: null },
            } : null,
            geo && where ? { key: "place", label: where, changes: { geo: null, where: null } } : null,
            stars ? { key: "stars", label: t("starsFrom", { value: stars }), changes: { stars: null } } : null,
            minPrice ? { key: "minPrice", label: list("priceFrom", { amount: minPrice, currency }), changes: { minPrice: null } } : null,
            maxPrice ? { key: "maxPrice", label: list("priceTo", { amount: maxPrice, currency }), changes: { maxPrice: null } } : null,
        ];
        const chips = proposals.flatMap(( chip ) => (chip ? [{
            key: chip.key, label: chip.label, remove: list("remove", { name: chip.label }), href: href(chip.changes),
        }] : []));
        const narrowed = chips.filter(( chip ) => chip.key !== "query").length;
        const results = total == null ? list("resultsTitle") : noun
            ? createTranslator({ locale, messages: { noun } })("noun", { count: total }) : list("results", { count: total });
        const first = (page - 1) * limit + 1;
        const hasNext = pages != null ? page < pages : items.length === limit;
        const clearAll = queryHref(base, text ? { query: text } : {}, {});

        return {
            failed: false as const,
            view,
            items,
            tabs: tabs && sections.length > 1 ? {
                label: t("tabs"),
                items: [
                    {
                        key: "all", label: t("all"), icon: "grid", count: count(everything, locale), href: href({ type: null }),
                        current: types.length !== 1,
                    },
                    ...sections,
                ],
            } : null,
            side: {
                title: t("title"),
                label: t("side"),
                state: t("selected"),
                clear: narrowed ? { href: clearAll, label: list("clear") } : null,
                groups: side,
                place: wanted.has("place") ? {
                    title: t("place"),
                    placeholder: t("placePlaceholder"),
                    empty: t("placeEmpty"),
                    searching: list("dialog.searching"),
                    clear: list("dialog.removePlace"),
                    chosen: geo && where ? { label: where, href: href({ geo: null, where: null }) } : null,
                } : null,
                price: edges ? {
                    title: t("price"),
                    floor, ceiling, from, to,
                    step: Math.max(1, Math.round((ceiling - floor) / 100)),
                    bars: counts.map(( value, index ) => ({ key: String(edges[index]), count: value })),
                    currency,
                    glyph: hasGlyph(currency),
                    labels: {
                        minimum: list("dialog.minimum"), maximum: list("dialog.maximum"), lowest: list("dialog.lowest"),
                        highest: list("dialog.highest"), apply: t("apply"), reset: t("reset"),
                    },
                } : null,
                matches: hits.length ? { title: t("matches"), items: hits } : null,
            },
            toolbar: {
                title: text ? t("titleQuery", { results, text }) : results,
                note: list("allIn"),
                chips: chips.filter(( chip ) => chip.key !== "query"),
                applied: list("applied"),
                filters: { label: t("title"), count: narrowed, show: t("show", { results }), close: list("dialog.close") },
                sortLabel: list("sort", { name: list(`sorts.${sort}`) }),
                sorts: catalogSorts
                    .filter(( key ) => (key !== "relevance" || text) && (
                        !result.meta.supports?.sorts.length || result.meta.supports.sorts.includes(key)
                    ))
                    .map(( key ) => ({ key, label: list(`sorts.${key}`), href: href({ sort: key }), current: key === sort })),
                views: {
                    label: t("views.label"),
                    items: (map ? ["list", "grid", "map"] as const : ["list", "grid"] as const).map(( key ) => ({
                        key, label: t(`views.${key}`), icon: key, href: href({ view: key === "list" ? null : key }),
                        current: key === view,
                    })),
                },
            },
            labels: { details: t("details"), list: results, map: t("views.mapLabel"), unmapped: t("unmapped") },
            map,
            empty: chips.length
                ? { art: "/assets/images/brand/discovery.webp", title: list("emptyTitle"), description: list("emptyBody"), filters: chips }
                : { art: "/assets/images/brand/folder.webp", title: list("noneTitle"), description: list("noneBody") },
            clear: chips.length ? { href: clearAll, label: list("clear") } : null,
            pager: {
                label: total == null ? list("page", { page: count(page, locale) }) : list("range", {
                    from: count(first, locale), to: count(first + items.length - 1, locale), total: count(total, locale),
                }),
                numbers: pages != null && pages > 1 ? {
                    label: common("pagination"), page, pages, previous: common("previous"), next: common("next"),
                    href: ( number: number ) => queryHref(base, query, { page: String(number) }),
                    pageLabel: ( number: number ) => common("pageNumber", { page: number }),
                } : null,
                previous: page > 1 ? { label: common("previous"), href: queryHref(base, query, { page: String(page - 1) }) } : null,
                next: hasNext ? { label: common("next"), href: queryHref(base, query, { page: String(page + 1) }) } : null,
            },
        };

    }
    catch ( error ) {

        const code = failureReference(error);

        return {
            failed: true as const,
            failure: {
                art: "/assets/images/brand/error.webp", title: list("errorTitle"), description: list("errorBody"), retry: list("retry"),
                support: null, reference: code ? { label: list("reference"), code } : null,
            },
        };

    }

}
