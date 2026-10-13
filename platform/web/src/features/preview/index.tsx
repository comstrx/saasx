"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Pane, { type Options } from "./components/pane";

export default function PreviewFeature ( props: FeatureProps<Options> ) {
    return <Pane {...props} />;
}
