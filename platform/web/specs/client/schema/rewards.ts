import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "rewards", path: "/rewards", icon: "medal",
        title: t("screens.rewards.title"), label: t("screens.rewards.label"), description: t("screens.rewards.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "rewards", heading: true }] }],
} satisfies SiteScreen;
