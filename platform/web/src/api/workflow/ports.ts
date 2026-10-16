import "server-only";

import { surfaceOf } from "engine/api";
import { portSource, portValue } from "engine/client";
import type { Route } from "engine/screen";
import type { Ports } from "../../lib/spec/feature.ts";
import { endpoints, type Feature, type OperationOf } from "../features/index.ts";
import { read, siteContent } from "./server.ts";

const surface = surfaceOf(endpoints, ( feature, operation, input ) => {

    return read(feature as Feature, operation as OperationOf<Feature>, input as never);

});
const source = portSource(surface, siteContent);

export function portOf ( ports: Ports, name: string, route: Route ): Promise<unknown> {

    return portValue(ports[name], route, source);

}
