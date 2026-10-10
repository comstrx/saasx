import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "categories",
        path: "/categories",
        title: t("screens.categories.title"),
        description: t("screens.categories.description"),
        icon: "grid",
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [
                {
                    name: "header",
                    heading: true,
                    options: { art: "folder", verticals: true },
                    features: [{ name: "search", options: { target: "/browse", source: "categories" } }],
                },
                { name: "categories", options: { view: "directory" } },
            ],
        },
    ],
} satisfies SiteScreen;
