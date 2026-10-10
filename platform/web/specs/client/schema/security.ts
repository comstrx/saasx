import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "security", path: "/settings/security", icon: "lock",
        title: t("screens.security.title"), label: t("screens.security.label"), description: t("screens.security.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "account", heading: true, options: { view: "security", tone: "ember" } },
        ],
    }],
} satisfies SiteScreen;
