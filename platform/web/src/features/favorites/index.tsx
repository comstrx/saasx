"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Favorites from "./components/favorites";

export const options = {
    login: "/login", browse: "/browse", limit: 12, art: "/assets/images/brand/heart.webp",
    tone: "red" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return (

        <Favorites title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} options={chosen} />

    );

}
