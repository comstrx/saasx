"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Inbox from "./components/inbox";

export const options = {
    login: "/login",
    order: "/orders/:orderId",
    ticket: "/support/:ticketId",
    wallet: "/wallet",
    art: "/assets/images/brand/access.webp",
    empty: "/assets/images/brand/bell.webp",
    tone: "amber" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Inbox title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />;

}
