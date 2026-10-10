import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Assurance from "./components/assurance";
import Recent from "./components/recent";
import Types from "./components/types";

export const options = {
    view: "products",
    title: "",
    description: "",
    limit: 8,
};

export default function Feature ({ options: chosen }: FeatureProps<typeof options>) {

    if ( chosen.view === "types" ) return <Types title={chosen.title} description={chosen.description} />;
    if ( chosen.view === "assurance" ) return <Assurance title={chosen.title} description={chosen.description} />;

    return <Recent {...chosen} />;

}
