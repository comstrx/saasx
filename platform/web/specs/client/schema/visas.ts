import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "visas",
        path: "/visas",
        title: t("screens.visas.title"),
        description: t("screens.visas.description"),
        icon: "stamp",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "passport",
                        verticals: true,
                        headline: t("screens.visas.headline"),
                        perks: [
                            t("screens.visas.perks.one"), t("screens.visas.perks.two"), t("screens.visas.perks.three"),
                        ],
                        actions: [
                            { label: t("screens.visas.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.visas.actions.more"), path: "/support", icon: "support" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/visas", dates: "none", guests: false } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted", type: "visa", dates: "none", limit: 24,
                        noun: t("screens.visas.results"),
                        groups: ["price", "rating", "category"],
                        tabs: false,
                        layout: "list",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
