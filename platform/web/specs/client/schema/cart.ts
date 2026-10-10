import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "cart", path: "/cart", icon: "bag",
        title: t("screens.cart.title"), label: t("screens.cart.label"), description: t("screens.cart.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "cart", heading: true },
        ],
    }],
} satisfies SiteScreen;
