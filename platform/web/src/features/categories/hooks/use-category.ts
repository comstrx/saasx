import { read, siteCurrency } from "@/api/workflow/server";
import { catalogScreen, screenArt, screenHref } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Route } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { screens, text } from "@/lib/spec/server";
import { count, decimal, instant, money, percent } from "@/lib/std/format";
import { orderDate } from "@/lib/std/orders";
import { entityId } from "@/lib/std/route";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Coupon = Awaited<ReturnType<typeof read<"categories", "coupons">>>["resource"][number];

function amountText ( value: Parameters<typeof money>[0], locale: string, currency: string ) {

    const found = money(value, locale, currency, true);

    return found ? found.before ? `${found.currency} ${found.number}` : `${found.number} ${found.currency}` : null;

}

type Labels = Awaited<ReturnType<typeof getTranslations<"directory">>>;

function couponView ( coupon: Coupon, locale: string, currency: string, t: Labels ) {

    const rate = percent(coupon.rate, locale);
    const amount = amountText(coupon.value, locale, currency);
    const minimum = amountText(coupon.min_price, locale, currency);
    const cap = amountText(coupon.cap, locale, currency);
    const live = coupon.is_valid !== false && (!coupon.expires_at || instant(coupon.expires_at) > Date.now());

    return {
        key: String(coupon.id),
        value: rate ?? amount ?? (coupon.points ? String(coupon.points) : "%"),
        caption: t(rate ? "stub.rate" : amount ? "stub.amount" : "stub.points"),
        name: coupon.name || coupon.code || "",
        code: coupon.code ?? null,
        description: coupon.description ?? coupon.conditions ?? null,
        terms: [
            minimum ? t("minimum", { amount: minimum }) : null,
            cap && rate ? t("cap", { amount: cap }) : null,
            coupon.stackable ? t("stackable") : null,
        ].filter(( value ): value is string => Boolean(value)),
        expires: coupon.expires_at ? t("until", { date: orderDate(coupon.expires_at, locale) ?? "" }) : null,
        status: { label: t(live ? "valid" : "expired"), tone: live ? "teal" as const : "neutral" as const },
        inactive: !live,
    };

}
export async function category ( route: Route ) {

    const [locale, t, currency] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("directory"), siteCurrency()]);
    const categoryId = entityId(route.parameters.categoryId);

    if ( !categoryId ) return null;

    try {

        const [view, coupons, inside] = await Promise.all([
            read("categories", "view", { categoryId }),
            read("categories", "coupons", { categoryId, limit: 6 }).then(( reply ) => reply.resource).catch(() => []),
            read("products", "list", {
                limit: 1, fields: ["id", "name", "type"], filters: { category: categoryId }, stats: ["min_price"], facets: ["type"],
            }).catch(() => null),
        ]);
        const row = view.resource;
        const index = screens.find(( screen ) => screen.name === "categories");
        const vertical = catalogScreen(row.icon);
        const total = row.catalogs ?? 0;
        const rating = Number(row.rating ?? 0);
        const reviews = row.reviews ?? 0;
        const place = [row.geo?.city?.name ?? row.geo?.geo?.name, row.geo?.country?.name].filter(Boolean).join(", ");
        const prices = inside?.meta.aggregates?.stats?.min_price;
        const cheapest = prices?.min != null && Number(prices.min) > 0 ? amountText(prices.min, locale, currency) : null;
        const dearest = prices?.max != null && Number(prices.max) > 0 ? amountText(prices.max, locale, currency) : null;
        const sections = Object.values(inside?.meta.aggregates?.facets?.type ?? {}).filter(( value ) => value > 0).length;
        const listed = inside?.meta.pagination?.total ?? total;
        const stat = ( value: number | null | undefined ) => value ? count(value, locale) : null;

        return {
            id: categoryId,
            title: row.name,
            saved: row.in_favorites === true,
            art: screenArt([vertical?.name, index?.name], "folder"),
            trail: {
                label: t("trail"),
                items: [
                    ...(index ? [{ label: text(index.title, locale), href: screenHref(index, locale) ?? undefined }] : []),
                    { label: row.name },
                ],
            },
            kind: vertical ? text(vertical.title, locale) : null,
            rating: rating > 0 && reviews > 0 ? {
                value: decimal(rating, locale, 1) ?? String(rating),
                count: t("reviewsCount", { count: reviews }),
                label: t("rating", { value: decimal(rating, locale, 1) ?? String(rating), count: reviews }),
            } : null,
            location: place || null,
            facts: [],
            about: row.description ?? null,
            stats: {
                label: t("stats.label"),
                items: [
                    {
                        key: "listings", label: t("stats.listings"), value: stat(listed), icon: "grid", tone: "teal",
                        caption: t("stats.listingsCaption"),
                    },
                    {
                        key: "rating", label: t("stats.rating"), value: rating > 0 ? decimal(rating, locale, 1) ?? null : null,
                        icon: "star", tone: "amber", caption: reviews ? t("reviewsCount", { count: reviews }) : null,
                    },
                    {
                        key: "from", label: t("stats.from"), value: cheapest, icon: "tag", tone: "ember",
                        caption: dearest && dearest !== cheapest ? t("stats.fromCaption", { amount: dearest }) : null,
                    },
                    { key: "bookings", label: t("stats.bookings"), value: stat(row.orders), icon: "receipt", tone: "green" },
                    { key: "views", label: t("stats.views"), value: stat(row.views), icon: "eye", tone: "blue" },
                    {
                        key: "sections", label: t("stats.sections"), value: sections > 1 ? stat(sections) : null, icon: "compass",
                        tone: "red",
                    },
                ].flatMap(( item ) => (item.value ? [{ ...item, value: item.value, tone: item.tone as Tone }] : [])),
            },
            coupons: coupons.map(( coupon ) => couponView(coupon, locale, "USD", t)),
            labels: { coupons: t("coupons"), couponsBody: t("couponsBody") },
        };

    }
    catch {

        return null;

    }

}
export async function categoryReviews ( route: Route ) {

    const categoryId = entityId(route.parameters.categoryId);

    if ( !categoryId ) return null;

    const [t, opinions] = await Promise.all([
        getTranslations("directory"),
        read("categories", "reviews", { categoryId, limit: 1 }).then(( reply ) => reply.resource.length).catch(() => 0),
    ]);

    return opinions > 0 ? { id: categoryId, title: t("reviews"), empty: t("noReviews") } : null;

}
