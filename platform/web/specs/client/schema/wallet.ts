import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "wallet", path: "/wallet", icon: "wallet",
        title: t("screens.wallet.title"), description: t("screens.wallet.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "wallet", heading: true }] }],
} satisfies SiteScreen;
