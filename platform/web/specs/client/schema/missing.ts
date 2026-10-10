import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "missing", path: "/404", icon: "search",
        title: t("screens.missing.title"), description: t("screens.missing.description"),
    },
    options: { index: false, seo: false },
    blocks: [{ options: { width: "wide" }, features: [{ name: "notice", heading: true }] }],
} satisfies SiteScreen;
