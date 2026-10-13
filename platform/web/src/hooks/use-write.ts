"use client";

import type { ApiSurface, RequestOptions } from "@engine/api";
import { type PortInput, type Runner, useOperation, type Written } from "@engine/context";
import { type CompiledPort, fillInput, type Route } from "@engine/spec";
import { useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { useSignals } from "@/hooks/use-signal";

const nowhere: Route = { parameters: {}, query: {} };

/**
 * A write port as a runnable action; the inputs the spec bound (route parameters, signals) ride
 * along with whatever the feature passes.
 */
export function useWrite ( port: CompiledPort | undefined, route: Route = nowhere ): Runner<PortInput, Written, RequestOptions> {

    const signals = useSignals();
    const runner = useOperation(useApi() as ApiSurface, port);
    const bound = port?.kind === "write" ? port.input : {};
    const filled = JSON.stringify(fillInput(bound, { ...route, signals }));
    const run = useCallback(( input: PortInput, options?: RequestOptions ) => runner.run({ ...(JSON.parse(filled) as PortInput), ...input }, options), [runner.run, filled]);

    return { ...runner, run };

}
