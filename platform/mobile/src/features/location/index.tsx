"use client";


import type { FeatureProps } from "@/lib/spec/feature";
import Locator, { type Options } from "./components/locator";

export default function LocationFeature ( props: FeatureProps<Options> ) {

    return <Locator {...props} />;

}
