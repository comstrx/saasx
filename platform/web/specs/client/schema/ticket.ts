import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "ticket", path: "/support/:ticketId", icon: "support",
        title: t("screens.support.title"), description: t("screens.support.description"),
    },
    options: { index: false, footer: "copyright", sidebar: true },
    blocks: [{ options: { width: "wide" }, features: [{ name: "tickets", heading: true, options: { view: "thread" } }] }],
} satisfies SiteScreen;
