import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "documents", path: "/settings/documents", icon: "id-card",
        title: t("screens.documents.title"), label: t("screens.documents.label"), description: t("screens.documents.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "account", heading: true, options: { view: "documents", tone: "teal" } },
        ],
    }],
} satisfies SiteScreen;
