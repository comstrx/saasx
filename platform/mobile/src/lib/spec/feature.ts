import type { FeatureProps as Props, Route as Routed } from "engine/screen";
import type { CompiledPort } from "engine/spec";
import type { Localized } from "engine/translate";
import type { ReactNode } from "react";
import type { CompiledScreen } from "./surface.ts";

export type Route = Routed;
export type Screen = Localized<CompiledScreen>;
export type Ports = Record<string, CompiledPort>;
export type FeatureProps<O extends Record<string, unknown> = Record<string, unknown>> = Props<O, Screen, ReactNode>;
