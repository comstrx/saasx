import type { CompiledPort, Localized, FeatureProps as Props, Route as Routed } from "@engine/spec";
import type { ReactNode } from "react";
import type { CompiledScreen } from "./surface.ts";

export type Route = Routed;
export type Screen = Localized<CompiledScreen>;
export type Ports = Record<string, CompiledPort>;
export type FeatureProps<O extends Record<string, unknown> = Record<string, unknown>> = Props<O, Screen, ReactNode>;
