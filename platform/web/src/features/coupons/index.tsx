"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Coupons from "./components/coupons";

export const options = {
    login: "/login",
    art: "/assets/images/brand/access.webp",
    empty: "/assets/images/brand/gift.webp",
    tone: "ember" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Coupons title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />;

}
