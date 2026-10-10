import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "activity", path: "/activity", icon: "list",
        title: t("screens.activity.title"), label: t("screens.activity.label"), description: t("screens.activity.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "logs", heading: true }] }],
} satisfies SiteScreen;
