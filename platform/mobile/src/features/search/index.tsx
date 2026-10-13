"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Box, { type Options } from "./components/box";

export default function Search ( props: FeatureProps<Options> ) {

    return <Box {...props} />;

}
