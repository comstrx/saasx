"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Referrals from "./components/referrals";

export const options = {
    login: "/login",
    art: "/assets/images/brand/access.webp",
    invite: "/assets/images/brand/celebrate.webp",
    landing: "/go",
    tone: "green" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Referrals title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />;

}
