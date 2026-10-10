import { read } from "@/api/workflow/server";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Route } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { count, day, decimal, percent } from "@/lib/std/format";
import { entityId } from "@/lib/std/route";
import { initials } from "@/lib/std/text";

export async function profile ( route: Route ) {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("vendors")]);
    const vendorId = entityId(route.parameters.vendorId);

    if ( !vendorId ) return null;

    try {

        const [view, opinions] = await Promise.all([
            read("vendors", "view", { vendorId }),
            read("vendors", "reviews", { vendorId, limit: 1 }).then(( reply ) => reply.resource.length).catch(() => 0),
        ]);
        const vendor = view.resource;
        const name = vendor.name ?? "";
        const score = decimal(vendor.rating, locale, 1);
        const reviews = vendor.reviews ?? 0;
        const listings = vendor.catalogs ?? 0;
        const years = vendor.member_since ? Math.max(0, new Date().getFullYear() - new Date(vendor.member_since).getFullYear()) : 0;
        const rate = percent(vendor.response?.rate, locale);
        const minutes = vendor.response?.minutes ?? 0;

        return {
            id: vendorId,
            name,
            initials: initials(name),
            image: vendor.image ?? null,
            verified: vendor.verified ? t("verified") : null,
            city: vendor.city?.name ? t("based", { city: vendor.city.name }) : null,
            since: vendor.member_since ? t("since", { date: day(vendor.member_since, locale, { month: "long", year: "numeric" }) }) : null,
            stats: [
                { key: "reviews", value: count(reviews, locale), label: t("reviewsLabel", { count: reviews }) },
                ...(score && reviews > 0 ? [{ key: "rating", value: score, label: t("ratingLabel") }] : []),
                { key: "listings", value: count(listings, locale), label: t("listingsLabel", { count: listings }) },
                ...(years > 0 ? [{ key: "years", value: count(years, locale), label: t("yearsLabel", { count: years }) }] : []),
            ],
            facts: [
                ...(rate ? [{ key: "rate", term: t("responseRate"), detail: rate, icon: "chat" }] : []),
                ...(minutes > 0 ? [{ key: "time", term: t("responseTime"), detail: t("responds", { minutes }), icon: "clock" }] : []),
                ...(vendor.city?.name ? [{ key: "city", term: t("location"), detail: vendor.city.name, icon: "pin" }] : []),
            ],
            labels: { reviews: t("reviewsTitle", { name }), noReviews: t("noReviews"), about: t("aboutTitle", { name }) },
            reviews: opinions > 0,
        };

    }
    catch {

        return null;

    }

}
