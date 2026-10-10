import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "cart-purchase", path: "/cart/checkout",
        title: t("cartPurchase.title"), description: t("cartPurchase.description"),
    },
    options: { index: false, footer: "copyright" },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "orders", heading: true, options: { view: "purchase" } },
        ],
    }],
} satisfies SiteScreen;
