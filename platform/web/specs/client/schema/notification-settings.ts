import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "notification-settings", path: "/settings/notifications", icon: "bell",
        title: t("screens.notificationSettings.title"),
        label: t("screens.notificationSettings.label"), description: t("screens.notificationSettings.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "account", heading: true, options: { view: "notifications", tone: "amber" } },
        ],
    }],
} satisfies SiteScreen;
