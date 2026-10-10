import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "home",
        path: "/",
        title: t("home.title"),
        label: t("screens.home.label"),
        description: t("home.description"),
        icon: "house",
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: { art: "discovery", prominent: true, verticals: true, trust: true },
                    features: [{ name: "search" }],
                },
                { name: "orders", options: { view: "upcoming" } },
                { name: "home", options: { view: "types", title: t("home.types"), description: t("home.typesBody") } },
                { name: "offers", options: { title: t("home.offers") } },
                {
                    name: "welcome",
                    options: {
                        title: t("welcome.title"),
                        body: t("welcome.body"),
                        start: t("welcome.start"),
                        later: t("welcome.later"),
                        close: t("welcome.close"),
                        benefits: [
                            { icon: "tag", text: t("welcome.benefits.prices") },
                            { icon: "calendar-check", text: t("welcome.benefits.cancel") },
                            { icon: "headset", text: t("welcome.benefits.support") },
                        ],
                    },
                },
                { name: "home", options: { title: t("home.latest"), description: t("home.latestBody"), limit: 12 } },
                { name: "geos", options: { title: t("home.destinations"), description: t("home.destinationsBody") } },
                { name: "categories", options: { title: t("home.categories"), description: t("home.categoriesBody"), source: "home" } },
                { name: "vendors", options: { title: t("home.hosts"), description: t("home.hostsBody") } },
                { name: "articles", options: { title: t("home.journal"), description: t("home.journalBody") } },
                { name: "home", options: { view: "assurance", title: t("home.assuranceTitle"), description: t("home.assuranceBody") } },
            ],
        },
    ],
} satisfies SiteScreen;
