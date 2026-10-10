import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Detail from "./components/detail";
import Faceted from "./components/faceted";

export const options = {
    view: "faceted",
    type: "",
    dates: "none",
    scope: "",
    noun: "",
    limit: 24,
    groups: ["place", "price", "category", "format", "rating"],
    tabs: true,
    map: { tiles: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", credit: "© OpenStreetMap contributors" },
    layout: "list",
};

export default function Feature ({ options: chosen, screen, route }: FeatureProps<typeof options>) {

    if ( chosen.view === "detail" ) return <Detail screen={screen} route={route} atlas={chosen.map} />;

    return (

        <Faceted
            screen={screen} route={route} scope={chosen.scope} limit={chosen.limit} groups={chosen.groups} tabs={chosen.tabs}
            type={chosen.type} dates={chosen.dates} noun={chosen.noun} layout={chosen.layout === "grid" ? "grid" : "list"} map={chosen.map}
        />

    );

}
