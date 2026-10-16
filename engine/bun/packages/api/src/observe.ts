import { describe, type Failure } from "engine/error";
import type { Beacon } from "./beacon.ts";

export type Outcome = {
    call: string;
    ms: number;
    trace?: string | undefined;
    request?: string | undefined;
    error?: Failure | undefined;
};
export type Observer = ( outcome: Outcome ) => void;
export type Level = "warn" | "error";
export type Report = { level: Level; event: string; facts: Record<string, unknown> };

const rateLimited = 429;
const serverFloor = 500;

function severity ( error: Failure ): Level | undefined {

    if ( error.kind === "aborted" || error.kind === "configuration" ) return undefined;
    if ( ["network", "timeout", "input"].includes(error.kind) || error.status === rateLimited ) return "warn";

    return error.kind !== "http" || error.status >= serverFloor ? "error" : undefined;

}
export function reportOf ( { call, ms, trace, request, error }: Outcome, slow: number ): Report | undefined {

    const time = Math.round(ms);

    if ( !error )
        return time >= slow
            ? { level: "warn", event: "api.slow", facts: { call, ms: time, trace, request } }
            : undefined;

    const level = severity(error);

    if ( !level ) return undefined;

    return {
        level,
        event: "api.failure",
        facts: { call, ms: time, ...error.facts(), trace, request, cause: describe(error).cause },
    };

}

export type Metric = { call: string; count: number; failures: number; ms: number; max: number };
export type Meter = { record: Observer; flush: () => Metric[] };

export function createMeter (): Meter {

    let counters = new Map<string, Metric>();

    return {
        record: ({ call, ms, error }) => {

            const time = Math.round(ms);
            const metric = counters.get(call) ?? { call, count: 0, failures: 0, ms: 0, max: 0 };

            metric.count += 1;
            metric.failures += error ? 1 : 0;
            metric.ms += time;
            metric.max = Math.max(metric.max, time);
            counters.set(call, metric);

        },
        flush: () => {

            const flushed = [...counters.values()];

            counters = new Map();

            return flushed;

        },
    };

}
export type Signal =
    | { kind: "report"; report: Report; outcome: Outcome; trace: string }
    | { kind: "metrics"; metrics: Metric[]; trace: string }
    | { kind: "error"; name: string; reason: string; trace: string };
export type ObserverOptions = {
    trace: string;
    slow: number;
    send: ( signal: Signal ) => void;
    watch?: (( flush: () => void ) => void) | undefined;
};
export type Observation = {
    trace: string;
    observeCall: Observer;
    flushMetrics: () => void;
    reportError: ( name: string, error: unknown ) => void;
};

export function createObserver ({ trace, slow, send, watch }: ObserverOptions): Observation {

    const meter = createMeter();
    let watching = false;

    const flushMetrics = (): void => {

        const metrics = meter.flush();

        if ( metrics.length ) send({ kind: "metrics", metrics, trace });

    };

    return {
        trace,
        flushMetrics,
        observeCall: ( outcome ) => {

            meter.record(outcome);

            if ( !watching ) {

                watching = true;
                watch?.(flushMetrics);

            }

            const report = reportOf(outcome, slow);

            if ( report ) send({ kind: "report", report, outcome, trace });

        },
        reportError: ( name, error ) => send({ kind: "error", name, reason: error instanceof Error ? error.name : "unknown", trace }),
    };

}

export function beaconOf ( signal: Signal, page: string ): Beacon {

    if ( signal.kind === "metrics" ) return { trace: signal.trace, metrics: signal.metrics, page };
    if ( signal.kind === "error" ) return {
        call: `render.${signal.name}`,
        ms: 0,
        trace: signal.trace,
        kind: "render",
        reason: signal.reason,
        page,
    };

    const { call, ms, request } = signal.outcome;
    const facts = signal.report.facts as { kind?: string; status?: number; reason?: string };

    return { call, ms: Math.round(ms), trace: signal.trace, request, kind: facts.kind, status: facts.status, reason: facts.reason, page };

}
