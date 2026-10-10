import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Archive from "./components/archive";
import Article from "./components/article";
import Latest from "./components/latest";

export const options = {
    view: "latest",
    title: "",
    description: "",
    limit: 3,
    login: "/login",
};

export default function Feature ({ options: chosen, screen, route }: FeatureProps<typeof options>) {

    if ( chosen.view === "archive" ) return <Archive screen={screen} route={route} />;
    if ( chosen.view === "article" ) return <Article route={route} login={chosen.login} />;

    return <Latest {...chosen} />;

}
