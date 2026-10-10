import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "promo", path: "/go/:key",
        title: t("screens.promo.title"), description: t("screens.promo.description"),
    },
    options: { render: "client", seo: false, index: false, footer: "copyright" },
    blocks: [{ options: { width: "narrow" }, features: [{ name: "promo", heading: true }] }],
} satisfies SiteScreen;
