import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "social-callback",
        path: "/auth/callback",
        title: t("screens.socialCallback.title"),
        description: t("screens.socialCallback.description"),
    },
    options: { index: false, footer: "copyright" },
    blocks: [
        {
            options: { width: "wide" },
            features: [{
                name: "auth", heading: true,
                options: { view: "callback", art: "/assets/images/brand/access.webp" },
            }],
        },
    ],
} satisfies SiteScreen;
