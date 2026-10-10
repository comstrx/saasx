import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "shop",
        path: "/shop",
        title: t("screens.shop.title"),
        description: t("screens.shop.description"),
        icon: "bag",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "shopping",
                        verticals: true,
                        headline: t("screens.shop.headline"),
                        perks: [
                            t("screens.shop.perks.one"), t("screens.shop.perks.two"), t("screens.shop.perks.three"),
                        ],
                        actions: [
                            { label: t("screens.shop.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.shop.actions.more"), path: "/categories", icon: "grid" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/shop", dates: "none", guests: false } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted", type: "product", dates: "none", limit: 24,
                        noun: t("screens.shop.results"),
                        groups: ["price", "format", "rating", "category"],
                        tabs: false,
                        layout: "grid",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
