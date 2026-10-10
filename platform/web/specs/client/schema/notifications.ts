import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "notifications", path: "/notifications", icon: "inbox",
        title: t("screens.notifications.title"), description: t("screens.notifications.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "notifications", heading: true }] }],
} satisfies SiteScreen;
