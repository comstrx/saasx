import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "reviews", path: "/reviews", icon: "star",
        title: t("screens.reviews.title"), label: t("screens.reviews.label"), description: t("screens.reviews.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "reviews", heading: true }] }],
} satisfies SiteScreen;
