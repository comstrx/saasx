import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "insurance",
        path: "/insurance",
        title: t("screens.insurance.title"),
        description: t("screens.insurance.description"),
        icon: "shield",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "nav-insurance",
                        verticals: true,
                        headline: t("screens.insurance.headline"),
                        perks: [
                            t("screens.insurance.perks.one"), t("screens.insurance.perks.two"), t("screens.insurance.perks.three"),
                        ],
                        actions: [
                            { label: t("screens.insurance.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.insurance.actions.more"), path: "/support", icon: "support" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/insurance", dates: "none", guests: false } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted", type: "insurance", dates: "none", limit: 24,
                        noun: t("screens.insurance.results"),
                        groups: ["price", "rating", "category"],
                        tabs: false,
                        layout: "list",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
