import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Band from "./components/band";
import Board from "./components/board";
import Campaign from "./components/campaign";
import Detail from "./components/detail";

export const options = {
    view: "band",
    title: "",
    limit: 3,
    art: "gift",
    source: "list" as "home" | "list",
};

export default function Feature ({ options: chosen, route }: FeatureProps<typeof options>) {

    if ( chosen.view === "board" ) return <Board art={chosen.art} />;
    if ( chosen.view === "detail" ) return <Detail route={route} />;
    if ( chosen.view === "campaign" ) return <Campaign route={route} />;

    return <Band {...chosen} />;

}
