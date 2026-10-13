"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Grid, { type Options } from "./components/grid";

export default function TableFeature ( props: FeatureProps<Options> ) {

    return <Grid {...props} />;

}
