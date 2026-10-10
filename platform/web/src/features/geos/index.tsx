import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Atlas from "./components/atlas";
import Destination from "./components/destination";
import Trending from "./components/trending";

export const options = {
    view: "trending",
    title: "",
    description: "",
    limit: 5,
};

export default function Feature ({ options: chosen, route }: FeatureProps<typeof options>) {

    if ( chosen.view === "atlas" ) return <Atlas title={chosen.title} description={chosen.description} />;
    if ( chosen.view === "detail" ) return <Destination route={route} />;

    return <Trending {...chosen} />;

}
