import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Missing from "./components/missing";

export const options = {
    view: "missing",
    art: "/assets/images/brand/search.webp",
    links: ["home", "stays", "orders", "support"],
};

export default function Feature ({ options: chosen }: FeatureProps<typeof options>) {

    return <Missing art={chosen.art} links={chosen.links} />;

}
