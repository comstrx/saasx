"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Messenger from "./components/messenger";

export const options = {
    login: "/login",
    art: "/assets/images/brand/access.webp",
    empty: "/assets/images/brand/chat.webp",
    tone: "teal" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Messenger title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />;

}
