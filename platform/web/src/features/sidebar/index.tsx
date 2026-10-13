import "server-only";

import type { FeatureProps } from "@/lib/spec/feature";
import List, { type Options } from "./components/list";

export default function SidebarFeature ( props: FeatureProps<Options> ) {

    return <List {...props} />;

}
