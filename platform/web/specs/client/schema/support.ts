import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "support", path: "/support", icon: "support",
        title: t("screens.support.title"), label: t("screens.support.label"), description: t("screens.support.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "tickets", heading: true }] }],
} satisfies SiteScreen;
