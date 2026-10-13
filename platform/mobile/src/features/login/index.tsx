"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Flow, { type Options } from "./components/flow";

export default function Login ( props: FeatureProps<Options> ) {

    return <Flow {...props} />;

}
