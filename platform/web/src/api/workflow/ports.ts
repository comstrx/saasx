import "server-only";

import type { ApiSurface } from "@engine/api";
import { portSource, portValue, type Route } from "@engine/spec";
import type { Ports } from "../../lib/spec/feature.ts";
import { endpoints, type Feature, features, type OperationOf } from "../features/index.ts";
import { read, siteContent } from "./server.ts";

const surface: ApiSurface = Object.fromEntries(features.map(( feature: Feature ) => [
    feature,
    Object.fromEntries(Object.keys(endpoints[feature]).map(( operation ) => [operation, ( input?: unknown ) => read(feature, operation as OperationOf<Feature>, input as never)])),
]));
const source = portSource(surface, siteContent);

export function portOf ( ports: Ports, name: string, route: Route ): Promise<unknown> {

    return portValue(ports[name], route, source);

}
