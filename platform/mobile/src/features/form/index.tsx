"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Editor, { type Options } from "./components/editor";

export default function FormFeature ( props: FeatureProps<Options> ) {
    return <Editor {...props} />;
}
