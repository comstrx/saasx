import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "insurance-item",
        path: "/insurance/:productId",
        title: t("screens.insurance.title"),
        description: t("screens.insurance.description"),
        entity: { kind: "product", types: ["insurance"] },
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [{ name: "products", heading: true, options: { view: "detail" } }],
        },
    ],
} satisfies SiteScreen;
