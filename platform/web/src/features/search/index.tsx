import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Results from "./components/results";
import Search from "./components/search";

export const options = {
    view: "bar",
    target: "/search",
    dates: "none",
    guests: false,
    source: "all",
    limit: 24,
    groups: ["place", "price", "category", "format", "rating"],
    tabs: true,
    map: { tiles: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", credit: "© OpenStreetMap contributors" },
};

export default function Feature ({ options: chosen, screen, route }: FeatureProps<typeof options>) {

    return chosen.view === "results" ? (

        <Results screen={screen} route={route} limit={chosen.limit} groups={chosen.groups} tabs={chosen.tabs} map={chosen.map} />

    ) : <Search key={JSON.stringify(route.query)} {...chosen} />;

}
