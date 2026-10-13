"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import View, { type Options } from "./components/view";

export default function Detail ( props: FeatureProps<Options> ) {
    return <View {...props} />;
}
