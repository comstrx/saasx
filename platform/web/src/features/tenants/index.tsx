"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Onboarding from "./components/onboarding";
import Workspaces from "./components/workspaces";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";

export const options = {
    view: "list" as "list" | "create",
    login: "/login",
    plans: "/plans",
    create: "/workspaces/new",
    workspaces: "/workspaces",
    art: "/assets/images/brand/access.webp",
    empty: "/assets/images/brand/domain-property.webp",
    tone: "blue" as Tone,
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    const shared = { title: screen.title, description: screen.description, icon: screen.icon ?? null, tone: chosen.tone, links: chosen };

    return chosen.view === "create" ? <Onboarding {...shared} /> : <Workspaces {...shared} />;

}
