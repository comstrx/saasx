import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "stays-item",
        path: "/stays/:productId",
        title: t("screens.stays.title"),
        description: t("screens.stays.description"),
        entity: { kind: "product", types: ["hotel", "room"] },
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [{ name: "products", heading: true, options: { view: "detail" } }],
        },
    ],
} satisfies SiteScreen;
