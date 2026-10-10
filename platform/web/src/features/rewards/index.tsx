"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Rewards from "./components/rewards";

export const options = {
    login: "/login",
    art: "/assets/images/brand/access.webp",
    level: "/assets/images/brand/member.webp",
    empty: "/assets/images/brand/gift.webp",
    tone: "amber" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Rewards title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />;

}
