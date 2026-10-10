import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "offers",
        path: "/offers",
        title: t("screens.offers.title"),
        description: t("screens.offers.description"),
        icon: "percent",
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [
                { name: "header", heading: true, options: { art: "gift" } },
                { name: "offers", options: { view: "board", art: "gift" } },
            ],
        },
    ],
} satisfies SiteScreen;
