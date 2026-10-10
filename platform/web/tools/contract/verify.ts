import type { Endpoint } from "../../src/api/core/dsl.ts";
import { resolveApi } from "../../src/api/core/resolve.ts";
import { decode } from "../../src/api/core/response.ts";
import type { Contract, Wire } from "../../src/api/core/wire.ts";
import { endpoints } from "../../src/api/features/index.ts";
import { z } from "../../src/lib/providers/schema.ts";
import { errorFacts } from "../../src/lib/std/log.ts";
import { isRecord, pathGet } from "../../src/lib/std/object.ts";

export type Target = { api: string; tenant: string };
export type Sample = { status: number; body: unknown };
export type Samples = Record<string, Sample>;

export const fixture = "tools/contract/samples.json";
const catalogue: Record<string, Record<string, Endpoint>> = endpoints;

export function coreContract ( { api }: Target ) {

    return resolveApi({
        context: { spec: "client", currency: "USD", authCookie: null, proxies: 1 },
        connections: { primary: { baseUrl: api }, broadcast: { baseUrl: new URL(api).origin } },
    });

}
function operationOf ( call: string, contract: Contract ): { endpoint?: Endpoint; wire?: Wire } {

    const [feature = "", operation = ""] = (call.split("#")[0] ?? "").split(".");
    const wire = contract.features[feature]?.[operation];

    return { endpoint: catalogue[feature]?.[operation], wire: wire?.enabled ? wire : undefined };

}
function expected ( endpoint: Endpoint, wire: Wire ): string[] {

    const output = endpoint.output;

    if ( !(output instanceof z.ZodObject) || endpoint.local ) return [];

    return Object.keys(output.shape).map(( key ) => (wire.response.fields[key] ?? key).split(".")[0] ?? key);

}
function present ( { body }: Sample, endpoint: Endpoint, wire: Wire ): Set<string> | undefined {

    const data = pathGet(body, wire.response.data);
    const rows = endpoint.many && Array.isArray(data) ? data : [data];
    const keys = rows.flatMap(( row ) => isRecord(row) ? Object.keys(row) : []);

    return keys.length ? new Set(keys) : undefined;

}
function absent ( call: string, sample: Sample, contract: Contract ): string[] {

    const { endpoint, wire } = operationOf(call, contract);
    const keys = endpoint && wire && !call.endsWith("#tiny") ? present(sample, endpoint, wire) : undefined;

    if ( !endpoint || !wire || !keys ) return [];

    const missing = [...new Set(expected(endpoint, wire))].filter(( key ) => key !== "$" && !keys.has(key));

    return missing.length ? [`${call}: ${missing.join(", ")}`] : [];

}
function issues ( call: string, { status, body }: Sample, contract: Contract ): string[] {

    const { endpoint, wire } = operationOf(call, contract);

    if ( !endpoint || !wire ) return [`${call}: the core has no enabled operation by this name.`];

    try {

        decode(wire, endpoint, endpoint.local ? contract.values[endpoint.local] : undefined, { status, ok: status < 400, body });

        return [];

    }
    catch ( error ) {

        const { cause, message } = errorFacts(error);

        return [`${call}: ${cause ?? message}`];

    }

}
export function sampleIssues ( samples: Samples ): string[] {

    const { contract } = coreContract({ api: "https://api.invalid/v1", tenant: "samples.invalid" });

    return Object.entries(samples).flatMap(( [call, sample] ) => issues(call, sample, contract));

}
export function absentFields ( samples: Samples ): string[] {

    const { contract } = coreContract({ api: "https://api.invalid/v1", tenant: "samples.invalid" });

    return Object.entries(samples).flatMap(( [call, sample] ) => absent(call, sample, contract));

}
