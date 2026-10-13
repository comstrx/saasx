"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Menu, { type Options } from "./components/menu";

export default function Nav ( props: FeatureProps<Options> ) {

    return <Menu {...props} />;

}
