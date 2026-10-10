import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "experiences",
        path: "/experiences",
        title: t("screens.experiences.title"),
        description: t("screens.experiences.description"),
        icon: "compass",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "domain-tour",
                        verticals: true,
                        headline: t("screens.experiences.headline"),
                        perks: [
                            t("screens.experiences.perks.one"), t("screens.experiences.perks.two"), t("screens.experiences.perks.three"),
                        ],
                        actions: [
                            { label: t("screens.experiences.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.experiences.actions.more"), path: "/destinations", icon: "map" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/experiences", dates: "none", guests: false } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted", type: "tour", dates: "none", limit: 24,
                        noun: t("screens.experiences.results"),
                        groups: ["place", "price", "rating", "category"],
                        tabs: false,
                        layout: "grid",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
