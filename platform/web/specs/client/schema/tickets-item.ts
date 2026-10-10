import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "tickets-item",
        path: "/tickets/:productId",
        title: t("screens.tickets.title"),
        description: t("screens.tickets.description"),
        entity: { kind: "product", types: ["ticket"] },
    },
    blocks: [
        {
            options: { width: "wide", gap: 12 },
            features: [{ name: "products", heading: true, options: { view: "detail" } }],
        },
    ],
} satisfies SiteScreen;
