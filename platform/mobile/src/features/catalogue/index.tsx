"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Listing, { type Options } from "./components/listing";

export default function Catalogue ( props: FeatureProps<Options> ) {

    return <Listing {...props} />;

}
