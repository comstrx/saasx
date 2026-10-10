import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "order", path: "/orders/:orderId",
        title: t("screens.order.title"), description: t("screens.order.description"), icon: "receipt",
    },
    options: { index: false, footer: "copyright" },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "orders", heading: true, options: { view: "detail" } },
        ],
    }],
} satisfies SiteScreen;
