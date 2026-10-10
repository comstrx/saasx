import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "orders", path: "/orders", icon: "receipt",
        title: t("screens.orders.title"), label: t("screens.orders.label"), description: t("screens.orders.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{
        options: { width: "wide" },
        features: [
            { name: "auth", options: { view: "prompt", art: "/assets/images/brand/access.webp" } },
            { name: "orders", heading: true, options: { view: "list" } },
        ],
    }],
} satisfies SiteScreen;
