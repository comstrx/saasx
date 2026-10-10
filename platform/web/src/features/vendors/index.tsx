import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Profile from "./components/profile";
import Reviews from "./components/reviews";
import Top from "./components/top";

export const options = {
    view: "top",
    title: "",
    description: "",
    limit: 4,
};

export default function Feature ({ options: chosen, route }: FeatureProps<typeof options>) {

    if ( chosen.view === "profile" ) return <Profile route={route} />;
    if ( chosen.view === "reviews" ) return <Reviews route={route} />;

    return <Top {...chosen} />;

}
