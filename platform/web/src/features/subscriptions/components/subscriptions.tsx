"use client";

import SubscriptionBoard from "@/components/subscription-board";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string; description: string; icon?: string | null; tone?: Tone;
    links: { login: string; plans: string; art: string; empty: string };
};

export default function Subscriptions ( props: Props ) {

    return <SubscriptionBoard {...props} />;

}
