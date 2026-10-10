import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Welcome from "./components/welcome";

export const options = {
    art: "welcome",
    title: "",
    body: "",
    start: "",
    later: "",
    close: "",
    benefits: [] as { icon: string; text: string }[],
};

export default function Feature ({ options: chosen }: FeatureProps<typeof options>) {

    return <Welcome {...chosen} />;

}
