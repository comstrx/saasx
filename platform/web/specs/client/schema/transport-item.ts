import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "transport-item",
        path: "/transport/:productId",
        title: t("screens.transport.title"),
        description: t("screens.transport.description"),
        entity: { kind: "product", types: ["travel"] },
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [{ name: "products", heading: true, options: { view: "detail" } }],
        },
    ],
} satisfies SiteScreen;
