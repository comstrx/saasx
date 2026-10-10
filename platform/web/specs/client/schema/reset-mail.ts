import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "reset-mail",
        path: "/auth/reset",
        title: t("screens.reset.title"),
        description: t("screens.reset.description"),
    },
    options: { index: false, footer: "copyright" },
    blocks: [
        {
            options: { width: "wide" },
            features: [{
                name: "auth", heading: true,
                options: { view: "reset", art: "/assets/images/brand/access.webp" },
            }],
        },
    ],
} satisfies SiteScreen;
