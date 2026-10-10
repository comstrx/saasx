import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "place",
        path: "/places/:poiId",
        title: t("screens.place.title"),
        description: t("screens.place.description"),
        icon: "pin",
    },
    options: { index: false },
    blocks: [{ options: { width: "wide", gap: 12 }, features: [{ name: "pois", heading: true }] }],
} satisfies SiteScreen;
