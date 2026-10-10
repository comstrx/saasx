import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "terms",
        path: "/terms",
        title: t("screens.terms.title"),
        label: t("screens.terms.label"),
        description: t("screens.terms.description"),
        icon: "file",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [{ name: "documents", heading: true, options: { page: "terms", art: "document" } }],
        },
    ],
} satisfies SiteScreen;
