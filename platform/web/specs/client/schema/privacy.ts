import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "privacy",
        path: "/privacy",
        title: t("screens.privacy.title"),
        label: t("screens.privacy.label"),
        description: t("screens.privacy.description"),
        icon: "shield",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [{ name: "documents", heading: true, options: { page: "privacy", art: "access" } }],
        },
    ],
} satisfies SiteScreen;
