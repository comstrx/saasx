"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Bar, { type Options } from "./components/bar";

export default function TabsFeature ( props: FeatureProps<Options> ) {

    return <Bar {...props} />;

}
