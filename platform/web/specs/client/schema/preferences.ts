import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "preferences", path: "/settings/preferences", icon: "sliders",
        title: t("screens.preferences.title"), label: t("screens.preferences.label"), description: t("screens.preferences.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "account", heading: true, options: { view: "preferences", tone: "green" } },
        ],
    }],
} satisfies SiteScreen;
