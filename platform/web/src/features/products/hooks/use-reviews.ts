import { read } from "@/api/workflow/server";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { count } from "@/lib/std/format";

const levels = [5, 4, 3, 2, 1] as const;

async function spread ( productId: number ): Promise<Record<number, number>> {

    try {

        const result = await read("products", "reviews", { productId, limit: 1, facets: ["rating"] });
        const facet = result.meta.aggregates?.facets?.rating ?? {};
        const buckets: Record<number, number> = {};

        for ( const [key, amount] of Object.entries(facet) ) {

            const level = Math.min(5, Math.max(1, Math.round(Number(key))));

            if ( Number.isFinite(level) ) buckets[level] = (buckets[level] ?? 0) + Number(amount ?? 0);

        }

        return buckets;

    }
    catch {

        return {};

    }

}
export async function reviews ( productId: number, page: number ) {

    const [locale, t, common, buckets] = await Promise.all([
        getLocale(), getTranslations("detail"), getTranslations("common"), spread(productId),
    ]);
    const total = Object.values(buckets).reduce(( sum, amount ) => sum + amount, 0);
    const bars = total ? levels.map(( level ) => ({
        key: String(level),
        label: count(level, locale),
        count: count(buckets[level] ?? 0, locale),
        share: Math.round(((buckets[level] ?? 0) / total) * 100),
        name: t("starShare", { stars: level, count: buckets[level] ?? 0 }),
    })) : [];

    try {

        const result = await read("products", "reviews", { productId, page, limit: 6 });

        return {
            failed: false as const,
            bars,
            labels: { summary: t("reviewSummary"), note: t("reviewNote"), empty: t("noReviews"), emptyBody: t("noReviewsBody") },
            page: t("reviewPage", { page: count(page, locale) }),
            previous: page > 1 ? common("previous") : null,
            next: result.meta.pagination?.pages != null ? (
                page < result.meta.pagination.pages ? common("next") : null
            ) : result.resource.length === 6 ? common("next") : null,
            items: result.resource,
        };

    }
    catch {

        return { failed: true as const, bars, labels: { summary: t("reviewSummary"), note: t("reviewNote"), empty: t("noReviews") } };

    }

}
