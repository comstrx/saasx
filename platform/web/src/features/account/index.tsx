"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Account from "./components/account";

export const options = {
    view: "personal", login: "/login", personal: "/settings", preferences: "/settings/preferences",
    security: "/settings/security", documents: "/settings/documents", notifications: "/settings/notifications", recover: "/recover",
    country: "", files: "/assets/images/brand/folder.webp",
    tone: "blue" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Account title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} options={chosen} />;

}
