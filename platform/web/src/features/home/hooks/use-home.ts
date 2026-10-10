import { read } from "@/api/workflow/server";
import { entityHref, screenArt, screenHref, verticals } from "@/hooks/use-catalog";
import { productCard, productFields, productLabels } from "@/hooks/use-product-card";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Locale } from "@/lib/spec/languages";
import { screens, text } from "@/lib/spec/server";
import { count } from "@/lib/std/format";

async function facets (): Promise<Record<string, number>> {

    try {

        const result = await read("products", "list", { limit: 1, facets: ["type"], fields: productFields });

        return result.meta.aggregates?.facets?.type ?? {};

    }
    catch {

        return {};

    }

}
export async function typeLinks () {

    const [locale, t, tally] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("discover"), facets()]);

    return verticals().map(( item ) => {

        const total = tally[String(item.options.type)] ?? 0;

        return {
            href: screenHref(item.screen, locale) ?? "/",
            label: text(item.screen.title, locale),
            description: text(item.screen.description, locale),
            art: screenArt([item.screen.name], "discovery"),
            count: total > 0 ? t("count", { count: total, formatted: count(total, locale) }) : null,
        };

    });

}
export async function assurances () {

    const t = await getTranslations("discover.assurance");
    const items = [
        { key: "prices", icon: "receipt" },
        { key: "payments", icon: "lock" },
        { key: "refunds", icon: "wallet" },
        { key: "support", icon: "headset" },
    ] as const;

    return items.map(( item ) => ({ ...item, title: t(`${item.key}.title`), body: t(`${item.key}.body`) }));

}
export async function recent ( limit: number ) {

    const [labels, t, home] = await Promise.all([productLabels(), getTranslations("listing"), getTranslations("common")]);
    const browse = screens.find(( screen ) => screen.name === "search");

    try {

        const result = await read("home", "products", { limit, fields: productFields });
        const items = result.resource.map(( row ) => {

            const card = productCard(row, {
                locale: labels.locale, href: entityHref("product", row, labels.locale), badges: true, labels: labels.card,
            });

            return { card, currencyLabel: labels.view.currency(row.currency ?? "USD") };

        });

        return {
            failed: false as const,
            items,
            action: browse ? { href: screenHref(browse, labels.locale) ?? "/", label: home("seeAll") } : undefined,
            empty: { title: t("recentEmptyTitle"), description: t("recentEmptyBody") },
        };

    }
    catch {

        return {
            failed: true as const,
            failure: { title: t("errorTitle"), description: t("errorBody"), retry: t("retry") },
        };

    }

}
