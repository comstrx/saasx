import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "about",
        path: "/about",
        title: t("screens.about.title"),
        label: t("screens.about.label"),
        description: t("screens.about.description"),
        icon: "info",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [{ name: "documents", heading: true, options: { page: "about", art: "member" } }],
        },
    ],
} satisfies SiteScreen;
