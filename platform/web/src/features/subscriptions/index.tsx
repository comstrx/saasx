"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Subscriptions from "./components/subscriptions";

export const options = {
    login: "/login",
    plans: "/plans",
    art: "/assets/images/brand/access.webp",
    empty: "/assets/images/brand/domain-property.webp",
    tone: "teal" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return (

        <Subscriptions title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />

    );

}
