import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "checkout", path: "/checkout/:productId",
        title: t("screens.checkout.title"), description: t("screens.checkout.description"),
    },
    options: { index: false, footer: "copyright" },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "orders", heading: true, options: { view: "checkout" } },
        ],
    }],
} satisfies SiteScreen;
