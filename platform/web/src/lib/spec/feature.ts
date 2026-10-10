import type { ReactNode } from "react";
import type { Localized } from "./fields.ts";
import type { CompiledScreen } from "./screens.ts";

export type Route = { parameters: Record<string, string>; query: Record<string, string | string[] | undefined> };
export type Screen = Localized<CompiledScreen>;
export type FeatureProps<O extends Record<string, unknown> = Record<string, unknown>> = {
    options: O;
    screen: Screen;
    route: Route;
    feature?: { id: string; heading: boolean };
    children?: ReactNode;
};
