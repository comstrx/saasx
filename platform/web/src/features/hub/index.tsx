import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Hub from "./components/hub";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Section = { screen: string; tone: Tone };

export const options = {
    sections: [
        { screen: "settings", tone: "blue" },
        { screen: "security", tone: "ember" },
        { screen: "documents", tone: "teal" },
        { screen: "preferences", tone: "green" },
        { screen: "notification-settings", tone: "amber" },
        { screen: "orders", tone: "teal" },
        { screen: "favorites", tone: "red" },
        { screen: "wallet", tone: "blue" },
        { screen: "rewards", tone: "amber" },
        { screen: "coupons", tone: "ember" },
        { screen: "referrals", tone: "green" },
        { screen: "subscriptions", tone: "teal" },
        { screen: "workspaces", tone: "blue" },
        { screen: "support", tone: "teal" },
        { screen: "activity", tone: "blue" },
    ] as Section[],
    personal: "settings",
    security: "security",
    wallet: "wallet",
    orders: "orders",
    notifications: "notifications",
    rewards: "rewards",
    login: "login",
    art: "/assets/images/brand/member.webp",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Hub {...chosen} title={screen.title} />;

}
