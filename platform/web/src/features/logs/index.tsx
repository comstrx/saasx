"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Activity from "./components/activity";

export const options = {
    login: "/login",
    art: "/assets/images/brand/access.webp",
    empty: "/assets/images/brand/folder.webp",
    tone: "blue" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Activity title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />;

}
