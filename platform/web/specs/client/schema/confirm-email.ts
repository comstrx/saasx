import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "confirm-email",
        path: "/confirm-email",
        title: t("screens.confirmEmail.title"),
        description: t("screens.confirmEmail.description"),
    },
    options: { index: false, footer: "copyright" },
    blocks: [
        {
            options: { width: "wide" },
            features: [{
                name: "auth", heading: true,
                options: { view: "confirm", art: "/assets/images/brand/access.webp" },
            }],
        },
    ],
} satisfies SiteScreen;
