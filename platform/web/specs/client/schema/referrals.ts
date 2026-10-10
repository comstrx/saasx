import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "referrals", path: "/referrals", icon: "users",
        title: t("screens.referrals.title"), label: t("screens.referrals.label"), description: t("screens.referrals.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "referrals", heading: true }] }],
} satisfies SiteScreen;
