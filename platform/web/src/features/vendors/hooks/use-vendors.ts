import { read } from "@/api/workflow/server";
import { entityHref } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Locale } from "@/lib/spec/languages";
import { count, day, decimal } from "@/lib/std/format";
import { initials } from "@/lib/std/text";

const joined = { month: "short", year: "numeric" } as const;

export async function topVendors ( limit: number ) {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("vendors")]);

    try {

        const result = await read("vendors", "list", { limit, sort: "highest_rated" });

        return result.resource.map(( vendor ) => {

            const score = decimal(vendor.rating, locale, 1);
            const reviews = vendor.reviews ?? 0;

            return {
                key: String(vendor.id),
                name: vendor.name ?? "",
                initials: initials(vendor.name ?? ""),
                image: vendor.image ?? null,
                href: entityHref("vendor", { id: vendor.id, slug: vendor.slug }, locale),
                verified: vendor.verified ? t("verified") : null,
                city: vendor.city?.name ? t("based", { city: vendor.city.name }) : null,
                listings: t("listings", { count: vendor.catalogs ?? 0 }),
                since: vendor.member_since ? t("since", { date: day(vendor.member_since, locale, joined) }) : null,
                rating: score && reviews > 0 ? {
                    value: score, count: count(reviews, locale), label: t("rating", { score, count: reviews }),
                } : null,
            };

        });

    }
    catch {

        return [];

    }

}
