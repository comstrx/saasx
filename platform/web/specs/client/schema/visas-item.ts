import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "visas-item",
        path: "/visas/:productId",
        title: t("screens.visas.title"),
        description: t("screens.visas.description"),
        entity: { kind: "product", types: ["visa"] },
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [{ name: "products", heading: true, options: { view: "detail" } }],
        },
    ],
} satisfies SiteScreen;
