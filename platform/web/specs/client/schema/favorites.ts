import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "favorites", path: "/favorites", icon: "heart",
        title: t("screens.favorites.title"), label: t("screens.favorites.label"), description: t("screens.favorites.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "favorites", heading: true },
        ],
    }],
} satisfies SiteScreen;
