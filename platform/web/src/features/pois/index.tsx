import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import Place from "./components/place";

export const options = {
    view: "detail",
};

export default function Feature ({ route }: FeatureProps<typeof options>) {

    return <Place route={route} />;

}
