"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Wallet from "./components/wallet";

export const options = {
    login: "/login",
    art: "/assets/images/brand/access.webp",
    empty: "/assets/images/brand/wallet.webp",
    tone: "blue" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Wallet title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />;

}
