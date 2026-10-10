import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "account", path: "/account", icon: "gauge",
        title: t("screens.account.title"), label: t("screens.account.label"), description: t("screens.account.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "hub", heading: true }] }],
} satisfies SiteScreen;
