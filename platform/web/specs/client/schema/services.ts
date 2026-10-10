import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "services",
        path: "/services",
        title: t("screens.services.title"),
        description: t("screens.services.description"),
        icon: "handshake",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "domain-service",
                        verticals: true,
                        headline: t("screens.services.headline"),
                        perks: [
                            t("screens.services.perks.one"), t("screens.services.perks.two"), t("screens.services.perks.three"),
                        ],
                        actions: [
                            { label: t("screens.services.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.services.actions.more"), path: "/categories", icon: "grid" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/services", dates: "none", guests: false } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted", type: "service", dates: "none", limit: 24,
                        noun: t("screens.services.results"),
                        groups: ["place", "price", "format", "rating", "category"],
                        tabs: false,
                        layout: "list",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
