import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Board from "./components/board";

type Duration = "monthly" | "yearly" | "lifetime";

export const options = {
    durations: ["monthly", "yearly", "lifetime"] as Duration[],
    initial: "yearly" as Duration,
    start: "workspace-new",
    limit: 6,
    art: "/assets/images/brand/domain-property.webp",
};

export default function Feature ({ options: chosen }: FeatureProps<typeof options>) {

    return <Board {...chosen} />;

}
