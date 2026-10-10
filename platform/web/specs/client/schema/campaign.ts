import { t } from "../../../src/lib/spec/define.ts";
import type { SiteScreen } from "../../../src/lib/spec/screens.ts";

export default {
    contents: {
        name: "campaign",
        path: "/offers/campaigns/:campaignId",
        title: t("screens.campaign.title"),
        description: t("screens.campaign.description"),
        icon: "megaphone",
    },
    options: { index: false },
    blocks: [{ options: { width: "wide", gap: 12 }, features: [{ name: "offers", heading: true, options: { view: "campaign" } }] }],
} satisfies SiteScreen;
