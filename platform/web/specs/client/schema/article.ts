import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "article",
        path: "/blog/:articleId",
        title: t("screens.blog.title"),
        description: t("screens.blog.description"),
        icon: "news",
        entity: "article",
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [{ name: "articles", heading: true, options: { view: "article" } }],
        },
    ],
} satisfies SiteScreen;
