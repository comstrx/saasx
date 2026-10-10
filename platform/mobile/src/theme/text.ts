import type { FontWeight, Script } from "@/theme/fonts";

type Metric = {
    size: number;
    height: number;
    weight: FontWeight;
    track: number;
};

type Rank = Record<Script, Metric>;

export type RankName =
    | "figure" | "hero" | "price" | "display" | "heading" | "section" | "title"
    | "action" | "otp" | "body" | "description" | "label" | "caption" | "note" | "footnote" | "micro";

const step = ( latin: readonly [ number, number, FontWeight ], arabic: readonly [ number, number ] ): Rank => ({
    latin: { size: latin[0], height: latin[1], weight: latin[2], track: 0 },
    arabic: { size: arabic[0], height: arabic[1], weight: latin[2] === "400" ? "400" : "500", track: 0 },
});

export const ranks: Record<RankName, Rank> = {
    figure: step([ 32, 44, "600" ], [ 28, 40 ]),
    hero: step([ 24, 34, "600" ], [ 21, 32 ]),
    otp: step([ 24, 34, "600" ], [ 21, 32 ]),
    price: step([ 20, 30, "600" ], [ 18, 28 ]),
    display: step([ 20, 30, "600" ], [ 18, 28 ]),
    heading: step([ 20, 30, "600" ], [ 18, 28 ]),
    section: step([ 18, 28, "600" ], [ 16, 26 ]),
    title: step([ 17, 26, "600" ], [ 15, 24 ]),
    body: step([ 16, 26, "400" ], [ 14, 24 ]),
    action: step([ 14, 22, "600" ], [ 13, 20 ]),
    description: step([ 14, 22, "400" ], [ 13, 22 ]),
    label: step([ 13, 20, "600" ], [ 12, 18 ]),
    caption: step([ 13, 20, "400" ], [ 12, 20 ]),
    note: step([ 12, 18, "400" ], [ 11, 18 ]),
    footnote: step([ 12, 18, "400" ], [ 11, 18 ]),
    micro: step([ 12, 18, "600" ], [ 11, 16 ]),
};
