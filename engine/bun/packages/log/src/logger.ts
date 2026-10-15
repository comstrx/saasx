import { describe } from "engine/error";

export type Level = "debug" | "info" | "warn" | "error";
export type Facts = Record<string, unknown>;
export type Entry = { level: Level; event: string; at: string } & Facts;
export type Sink = ( entry: Entry, line: string ) => void;
export type Logger = {
    debug: ( event: string, facts?: Facts ) => void;
    info: ( event: string, facts?: Facts ) => void;
    warn: ( event: string, facts?: Facts ) => void;
    error: ( event: string, facts?: Facts ) => void;
    with: ( bound: Facts ) => Logger;
};
export type Options = {
    level?: Level | undefined;
    sinks?: readonly Sink[] | undefined;
    redact?: readonly string[] | undefined;
};

const order: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const secrets = ["authorization", "cookie", "password", "secret", "token", "key"];

function sensitive ( key: string, redact: readonly string[] ): boolean {

    const lower = key.toLowerCase();

    return redact.some(( word ) => lower.includes(word));

}
function clean ( value: unknown, redact: readonly string[], depth = 0 ): unknown {

    if ( value instanceof Error ) return describe(value);
    if ( Array.isArray(value) ) return depth < 4 ? value.map(( item ) => clean(item, redact, depth + 1)) : "[…]";

    if ( value && typeof value === "object" ) {

        if ( depth >= 4 ) return "{…}";

        return Object.fromEntries(
            Object.entries(value)
                .filter(( [, item] ) => item !== undefined)
                .map(( [key, item] ) => [key, sensitive(key, redact) ? "[redacted]" : clean(item, redact, depth + 1)]),
        );

    }

    return value;

}
export function logLine ( level: Level, event: string, facts: Facts = {}, redact: readonly string[] = secrets ): string {

    return JSON.stringify({ level, event, at: new Date().toISOString(), ...(clean(facts, redact) as Facts) });

}
export function memorySink (): Sink & { entries: Entry[]; lines: string[] } {

    const entries: Entry[] = [];
    const lines: string[] = [];
    const sink = (( entry: Entry, line: string ) => {

        entries.push(entry);
        lines.push(line);

    }) as Sink & { entries: Entry[]; lines: string[] };

    sink.entries = entries;
    sink.lines = lines;

    return sink;

}
export function lineSink ( write: ( line: string ) => void ): Sink {

    return ( _entry, line ) => {

        write(line);

    };

}
export function createLogger (
    { level = "info", sinks = [], redact = secrets }: Options = {},
    bound: Facts = {},
): Logger {

    const emit = ( chosen: Level, event: string, facts: Facts = {} ): void => {

        if ( order[chosen] < order[level] ) return;

        const merged = { ...bound, ...facts };
        const line = logLine(chosen, event, merged, redact);
        const entry = JSON.parse(line) as Entry;

        for ( const sink of sinks ) sink(entry, line);

    };

    return {
        debug: ( event, facts ) => emit("debug", event, facts),
        info: ( event, facts ) => emit("info", event, facts),
        warn: ( event, facts ) => emit("warn", event, facts),
        error: ( event, facts ) => emit("error", event, facts),
        with: ( more ) => createLogger({ level, sinks, redact }, { ...bound, ...more }),
    };

}
