import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "blog",
        path: "/blog",
        title: t("screens.blog.title"),
        description: t("screens.blog.description"),
        icon: "news",
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [
                { name: "header", heading: true, options: { art: "document" } },
                { name: "articles", options: { view: "archive" } },
            ],
        },
    ],
} satisfies SiteScreen;
