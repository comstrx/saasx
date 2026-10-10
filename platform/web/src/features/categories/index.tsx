import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Category from "./components/category";
import Directory from "./components/directory";
import Popular from "./components/popular";
import Reviews from "./components/reviews";

export const options = {
    view: "popular",
    title: "",
    description: "",
    limit: 8,
    source: "list" as "home" | "list",
};

export default function Feature ({ options: chosen, route }: FeatureProps<typeof options>) {

    if ( chosen.view === "directory" ) return <Directory />;
    if ( chosen.view === "detail" ) return <Category route={route} />;
    if ( chosen.view === "reviews" ) return <Reviews route={route} />;

    return <Popular {...chosen} />;

}
