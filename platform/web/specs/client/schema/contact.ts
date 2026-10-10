import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "contact",
        path: "/contact",
        title: t("screens.contact.title"),
        label: t("screens.contact.label"),
        description: t("screens.contact.description"),
        icon: "headset",
    },
    blocks: [
        {
            options: { width: "wide", gap: 8 },
            features: [{ name: "documents", heading: true, options: { view: "contact", art: "chat" } }],
        },
    ],
} satisfies SiteScreen;
