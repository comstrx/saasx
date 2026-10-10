import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "tickets",
        path: "/tickets",
        title: t("screens.tickets.title"),
        description: t("screens.tickets.description"),
        icon: "ticket",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "domain-ticket",
                        verticals: true,
                        headline: t("screens.tickets.headline"),
                        perks: [
                            t("screens.tickets.perks.one"), t("screens.tickets.perks.two"), t("screens.tickets.perks.three"),
                        ],
                        actions: [
                            { label: t("screens.tickets.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.tickets.actions.more"), path: "/destinations", icon: "map" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/tickets", dates: "none", guests: false } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted", type: "ticket", dates: "none", limit: 24,
                        noun: t("screens.tickets.results"),
                        groups: ["place", "price", "rating", "category"],
                        tabs: false,
                        layout: "grid",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
