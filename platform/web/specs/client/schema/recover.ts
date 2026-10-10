import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "recover",
        path: "/recover",
        title: t("screens.recover.title"),
        description: t("screens.recover.description"),
    },
    options: { index: false, footer: "copyright" },
    blocks: [
        {
            options: { width: "wide" },
            features: [{
                name: "auth", heading: true,
                options: { view: "recover", art: "/assets/images/brand/access.webp", country: "SA" },
            }],
        },
    ],
} satisfies SiteScreen;
