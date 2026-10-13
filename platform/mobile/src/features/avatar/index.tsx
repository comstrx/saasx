"use client";


import type { FeatureProps } from "@/lib/spec/feature";
import Picker, { type Options } from "./components/picker";

export default function AvatarFeature ( props: FeatureProps<Options> ) {

    return <Picker {...props} />;

}
