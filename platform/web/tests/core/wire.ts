import { attempt, harness, invoke, type Recorded } from "./backend.ts";

export type Call = [string, string, Record<string, unknown>];

type Entry = { label: string; outcome: string } | ({ label: string } & Recorded);
type Golden = { common: Record<string, string>; calls: Entry[] };

function shared ( entries: Entry[] ): Record<string, string> {

    const recorded = entries.filter(( entry ): entry is { label: string } & Recorded => "headers" in entry);
    const [first, ...rest] = recorded;

    if ( !first ) return {};

    return Object.fromEntries(Object.entries(first.headers).filter(( [name, value] ) => rest.every(( entry ) => entry.headers[name] === value)));

}
function compact ( entry: Entry, common: Record<string, string> ): Entry {

    if ( !("headers" in entry) ) return entry;

    return { ...entry, headers: Object.fromEntries(Object.entries(entry.headers).filter(( [name] ) => !Object.hasOwn(common, name))) };

}
export async function recordWire ( calls: readonly Call[] ): Promise<Golden> {

    const lanes = { client: harness("client"), server: harness("server") };
    const entries: Entry[] = [];

    for ( const [feature, operation, input] of calls ) {

        const wire = lanes.client.contract.features[feature]?.[operation];
        const lane = wire?.enabled && wire.execution === "server" ? lanes.server : lanes.client;

        lane.calls.length = 0;

        const options = { idempotencyKey: operation === "pay" ? "k1" : undefined };
        const outcome = await attempt(invoke(lane.client, feature, operation, input, options));
        const [hit] = lane.calls;

        entries.push(hit ? { label: `${feature}.${operation}`, ...hit } : { label: `${feature}.${operation}`, outcome: outcome === "ok" ? "local" : outcome });

    }

    const common = shared(entries);

    return { common, calls: entries.map(( entry ) => compact(entry, common)) };

}
export function serializeWire ( golden: unknown ): string {

    return `${JSON.stringify(golden, null, 4)}\n`;

}
