import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Footer from "./components/footer";

type Group = { title: "explore" | "company" | "account" | "support"; links: string[] };
type Pledge = { icon: string; title: "secure" | "support" | "verified" | "flexible" };

export const options = {
    groups: [
        {
            title: "explore",
            links: ["stays", "homes", "experiences", "events", "tickets", "transport", "services", "visas", "insurance", "shop"],
        },
        { title: "company", links: ["about", "destinations", "categories", "offers", "plans", "blog", "contact"] },
        { title: "account", links: ["orders", "favorites", "wallet", "rewards", "settings"] },
        { title: "support", links: ["support", "terms", "privacy"] },
    ] as Group[],
    promises: [
        { icon: "lock", title: "secure" },
        { icon: "headset", title: "support" },
        { icon: "seal", title: "verified" },
        { icon: "calendar-check", title: "flexible" },
    ] as Pledge[],
};

export default function Feature ({ options: chosen, screen }: FeatureProps<typeof options>) {

    return <Footer groups={chosen.groups} promises={chosen.promises} compact={screen.options.footer === "copyright"} />;

}
