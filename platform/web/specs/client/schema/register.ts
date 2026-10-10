import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "register",
        path: "/register",
        title: t("screens.register.title"),
        description: t("screens.register.description"),
    },
    options: { index: false, footer: "copyright" },
    blocks: [
        {
            options: { width: "wide" },
            features: [{
                name: "auth", heading: true,
                options: { view: "register", art: "/assets/images/brand/access.webp", country: "SA" },
            }],
        },
    ],
} satisfies SiteScreen;
