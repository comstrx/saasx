import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "transport",
        path: "/transport",
        title: t("screens.transport.title"),
        description: t("screens.transport.description"),
        icon: "train",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "travel",
                        verticals: true,
                        headline: t("screens.transport.headline"),
                        perks: [
                            t("screens.transport.perks.one"), t("screens.transport.perks.two"), t("screens.transport.perks.three"),
                        ],
                        actions: [
                            { label: t("screens.transport.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.transport.actions.more"), path: "/destinations", icon: "map" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/transport", dates: "start", guests: false } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted", type: "travel", dates: "start", limit: 24,
                        noun: t("screens.transport.results"),
                        groups: ["place", "price", "rating", "category"],
                        tabs: false,
                        layout: "list",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
