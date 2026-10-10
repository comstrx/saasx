import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "login",
        path: "/login",
        title: t("screens.login.title"),
        description: t("screens.login.description"),
    },
    options: { index: false, footer: "copyright" },
    blocks: [
        {
            options: { width: "wide" },
            features: [{
                name: "auth", heading: true,
                options: { view: "login", art: "/assets/images/brand/access.webp", country: "SA" },
            }],
        },
    ],
} satisfies SiteScreen;
