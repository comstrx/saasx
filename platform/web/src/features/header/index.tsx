import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Header from "./components/header";

type Action = { label: string; path: string; icon: string | null };

export const options = {
    art: null as string | null,
    headline: "",
    actions: [] as Action[],
    perks: [] as string[],
    prominent: false,
    verticals: false,
    trust: false,
};

export default function Feature ({ options: chosen, screen, feature, children }: FeatureProps<typeof options>) {

    return <Header {...chosen} screen={screen} heading={feature?.heading ?? false}>{children}</Header>;

}
