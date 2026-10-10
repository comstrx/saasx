"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Cart from "./components/cart";

export const options = {
    login: "/login", checkout: "/cart/:cartId/checkout", group: "/cart/checkout",
    browse: "/browse", limit: 12, art: "/assets/images/brand/access.webp",
    tone: "teal" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Cart title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} options={chosen} />;

}
