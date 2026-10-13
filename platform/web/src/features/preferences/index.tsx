"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Panel, { type Options } from "./components/panel";

export default function PreferencesFeature ( props: FeatureProps<Options> ) {

    return <Panel {...props} />;

}
