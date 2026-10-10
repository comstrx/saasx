import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "coupons", path: "/coupons", icon: "tag",
        title: t("screens.coupons.title"), label: t("screens.coupons.label"), description: t("screens.coupons.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "coupons", heading: true }] }],
} satisfies SiteScreen;
