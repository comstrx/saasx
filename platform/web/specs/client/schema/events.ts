import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "events",
        path: "/events",
        title: t("screens.events.title"),
        description: t("screens.events.description"),
        icon: "calendar-star",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: {
                        art: "domain-event",
                        verticals: true,
                        headline: t("screens.events.headline"),
                        perks: [
                            t("screens.events.perks.one"), t("screens.events.perks.two"), t("screens.events.perks.three"),
                        ],
                        actions: [
                            { label: t("screens.events.actions.offers"), path: "/offers", icon: "gift" },
                            { label: t("screens.events.actions.more"), path: "/destinations", icon: "map" },
                        ],
                    },
                    features: [
                        { name: "search", options: { target: "/events", dates: "start", guests: false } },
                    ],
                },
                {
                    name: "products",
                    options: {
                        view: "faceted", type: "event", dates: "start", limit: 24,
                        noun: t("screens.events.results"),
                        groups: ["place", "price", "rating", "category"],
                        tabs: false,
                        layout: "grid",
                    },
                },
            ],
        },
    ],
} satisfies SiteScreen;
