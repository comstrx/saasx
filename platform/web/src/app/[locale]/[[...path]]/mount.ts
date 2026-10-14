"use client";

import views from "@spec/mount";
import { createElement } from "react";
import type { FeatureProps } from "@/lib/spec/feature";

type Props = FeatureProps & { name: string };

export function Mount ({ name, ...props }: Props) {

    const View = views[name];

    if ( !View ) throw new Error(`No client feature named ${name}.`);

    return createElement(View as never, props);

}
