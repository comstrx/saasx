import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Nav from "./components/nav";

export const options = {
    links: ["home", "about", "contact", "terms"],
    more: ["stays", "homes", "experiences", "events", "tickets", "transport", "services", "visas", "insurance", "shop"],
    account: ["account", "orders", "favorites", "wallet", "notifications", "settings"],
    tabs: ["home", "favorites", "orders", "messages", "account"],
    login: "login",
    profile: "account",
    favorites: "favorites",
    notifications: "notifications",
    preferences: "preferences",
    help: "support",
    explore: "home",
    search: "search",
    cart: "cart",
    order: "order",
    ticket: "ticket",
    wallet: "wallet",
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Nav {...chosen} current={screen.name} />;

}
