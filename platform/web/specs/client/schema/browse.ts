import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "browse",
        path: "/browse",
        title: t("discovery.title"),
        description: t("discovery.description"),
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
                    features: [{ name: "search", options: { target: "/browse" } }],
                },
                { name: "products" },
            ],
        },
    ],
} satisfies SiteScreen;
