"use client";

import type { FeatureProps } from "@/lib/spec/feature";
import Board, { type Options } from "./components/board";

export default function EmojiFeature ( props: FeatureProps<Options> ) {

    return <Board {...props} />;

}
