"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Reviews from "./components/reviews";

export const options = {
    login: "/login",
    art: "/assets/images/brand/access.webp",
    empty: "/assets/images/brand/heart.webp",
    tone: "amber" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Reviews title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />;

}
