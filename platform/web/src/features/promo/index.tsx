"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Landing from "./components/landing";

export const options = { art: "/assets/images/brand/gift.webp", home: "/" };

export default function Feature ({ options: chosen, route }: FeatureProps<typeof options>) {

    return <Landing parameters={route.parameters} art={chosen.art} home={chosen.home} />;

}
