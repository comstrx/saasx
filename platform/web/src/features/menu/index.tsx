import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Menu from "./components/menu";

export const options = {
    account: ["account", "settings", "preferences", "security", "documents", "notification-settings"],
    activity: ["orders", "favorites", "cart", "notifications", "messages"],
    money: ["wallet", "rewards", "coupons", "referrals", "subscriptions", "workspaces"],
    help: ["support", "reviews", "activity"],
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Menu {...chosen} current={screen.name} />;

}
