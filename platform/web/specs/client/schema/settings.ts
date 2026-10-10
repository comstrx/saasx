import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "settings", path: "/settings", icon: "user",
        title: t("screens.settings.title"), label: t("screens.settings.label"), description: t("screens.settings.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "account", heading: true, options: { view: "personal", country: "SA" } },
        ],
    }],
} satisfies SiteScreen;
