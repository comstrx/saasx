import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "messages", path: "/messages", icon: "chat",
        title: t("screens.messages.title"), label: t("screens.messages.label"), description: t("screens.messages.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "chat", heading: true }] }],
} satisfies SiteScreen;
