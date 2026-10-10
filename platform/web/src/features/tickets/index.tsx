"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Requests from "./components/requests";
import Thread from "./components/thread";

export const options = {
    view: "list",
    login: "/login",
    list: "/support",
    thread: "/support/:ticketId",
    order: "/orders/:orderId",
    art: "/assets/images/brand/access.webp",
    empty: "/assets/images/brand/chat.webp",
    tone: "teal" as "teal" | "blue" | "ember" | "green" | "amber" | "red",
};

export default function Feature ({ options: chosen, screen, route }: FeatureProps<typeof options>) {

    if ( chosen.view === "thread" ) return <Thread id={route.parameters.ticketId} title={screen.title} links={chosen} />;

    return <Requests title={screen.title} description={screen.description} icon={screen.icon ?? null} tone={chosen.tone} links={chosen} />;

}
