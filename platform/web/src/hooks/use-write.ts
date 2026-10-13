"use client";

import type { ApiSurface, RequestOptions } from "@engine/api";
import { type PortInput, type QueuedWrite, type Runner, useOperation, type Written } from "@engine/context";
import { type CompiledPort, fillInput, type Route } from "@engine/spec";
import { useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { type Permission, usePermission } from "@/hooks/use-permission";
import { useSignals } from "@/hooks/use-signal";
import { outbox } from "@/stores/outbox";

export type Write = Runner<PortInput, Written | QueuedWrite, RequestOptions> & Permission & { queued: boolean };
type Options = { queue?: boolean | undefined };

const nowhere: Route = { parameters: {}, query: {} };

/**
 * A write port as a runnable action: the inputs the spec bound (route parameters, signals) ride
 * along, the session's permission to run it is known before the first press, and with `queue`
 * a write the network cannot deliver waits in the outbox instead of failing.
 */
export function useWrite ( port: CompiledPort | undefined, route: Route = nowhere, { queue = false }: Options = {} ): Write {

    const signals = useSignals();
    const permission = usePermission(port);
    const runner = useOperation(useApi() as ApiSurface, port, queue ? outbox : undefined);
    const bound = port?.kind === "write" ? port.input : {};
    const filled = JSON.stringify(fillInput(bound, { ...route, signals }));
    const run = useCallback(( input: PortInput, options?: RequestOptions ) => runner.run({ ...(JSON.parse(filled) as PortInput), ...input }, options), [runner.run, filled]);
    const queued = runner.status === "done" && runner.result?.meta.source === "queued";

    return { ...runner, ...permission, run, queued };

}
