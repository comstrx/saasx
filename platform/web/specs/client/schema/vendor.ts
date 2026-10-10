import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "vendor",
        path: "/hosts/:vendorId",
        title: t("screens.vendor.title"),
        description: t("screens.vendor.description"),
        icon: "user",
        entity: "vendor",
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [
                { name: "vendors", heading: true, options: { view: "profile" } },
                {
                    name: "products",
                    options: { view: "faceted", scope: "vendor", limit: 12, groups: ["price", "category", "format", "rating"], tabs: true },
                },
                { name: "vendors", options: { view: "reviews" } },
            ],
        },
    ],
} satisfies SiteScreen;
