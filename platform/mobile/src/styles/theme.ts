import { config } from "@/lib/spec/runtime";
import { space } from "@/lib/spec/theme";

export type Palette = Record<string, string>;
export type Scheme = "light" | "dark";

export function palette ( scheme: Scheme ): Palette {

    return config.theme.colors[scheme];

}
export function step ( value: keyof typeof space ): number {

    return space[value];

}
