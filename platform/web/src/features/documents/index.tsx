import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Contact from "./components/contact";
import Page from "./components/page";

export const options = {
    view: "page",
    page: "about",
    art: "document",
};

export default function Feature ({ options: chosen, screen, feature }: FeatureProps<typeof options>) {

    const head = { title: screen.title, description: screen.description, art: chosen.art, heading: feature?.heading ?? false };

    if ( chosen.view === "contact" ) return <Contact {...head} />;

    return <Page page={chosen.page} {...head} />;

}
