import { read } from "@/api/workflow/server";
import { entityHref } from "@/hooks/use-catalog";
import { productCard, productFields, productLabels } from "@/hooks/use-product-card";
import { getTranslations } from "@/lib/providers/intl-server";

export async function similar ( productId: number ) {

    const [labels, t] = await Promise.all([productLabels(), getTranslations("common")]);

    try {

        const result = await read("products", "recommendations", { productId, limit: 4, fields: productFields });

        return {
            failed: false as const,
            items: result.resource.map(( row ) => ({
                card: productCard(row, {
                    locale: labels.locale, href: entityHref("product", row, labels.locale), badges: false, labels: labels.card,
                }),
                currencyLabel: labels.view.currency(row.currency ?? "USD"),
            })),
        };

    }
    catch {

        return {
            failed: true as const,
            failure: { title: t("failedTitle"), description: t("failedBody"), retry: t("retry") },
        };

    }

}
