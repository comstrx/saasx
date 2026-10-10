import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "search",
        path: "/search",
        title: t("screens.search.title"),
        label: t("screens.search.label"),
        description: t("screens.search.description"),
        icon: "search",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: { art: "search" },
                    features: [{ name: "search", options: { target: "/search" } }],
                },
                { name: "search", options: { view: "results", limit: 20 } },
            ],
        },
    ],
} satisfies SiteScreen;
