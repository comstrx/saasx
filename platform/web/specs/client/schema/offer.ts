import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "offer",
        path: "/offers/:offerId",
        title: t("screens.offer.title"),
        description: t("screens.offer.description"),
        icon: "percent",
    },
    options: { index: false },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [{ name: "offers", heading: true, options: { view: "detail" } }],
        },
    ],
} satisfies SiteScreen;
