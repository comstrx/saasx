import { describe, type Failure } from "@engine/error";

export type Outcome = {
    call: string;
    ms: number;
    trace?: string | undefined;
    request?: string | undefined;
    error?: Failure | undefined;
};
export type Observer = (outcome: Outcome) => void;
export type Level = "warn" | "error";
export type Report = { level: Level; event: string; facts: Record<string, unknown> };

const rateLimited = 429;
const serverFloor = 500;

function severity(error: Failure): Level | undefined {
    if (error.kind === "aborted" || error.kind === "configuration") return undefined;
    if (["network", "timeout", "input"].includes(error.kind) || error.status === rateLimited) return "warn";

    return error.kind !== "http" || error.status >= serverFloor ? "error" : undefined;
}
/**
 * What an outcome deserves in the log: a slow-call warning, a failure at its severity, or silence
 * for business refusals and aborts.
 */
export function reportOf({ call, ms, trace, request, error }: Outcome, slow: number): Report | undefined {
    const time = Math.round(ms);

    if (!error)
        return time >= slow
            ? { level: "warn", event: "api.slow", facts: { call, ms: time, trace, request } }
            : undefined;

    const level = severity(error);

    if (!level) return undefined;

    return {
        level,
        event: "api.failure",
        facts: { call, ms: time, ...error.facts(), trace, request, cause: describe(error).cause },
    };
}

export type Metric = { call: string; count: number; failures: number; ms: number; max: number };
export type Meter = { record: Observer; flush: () => Metric[] };

/**
 * Counters per operation: calls, failures, time spent and the slowest call, gathered in memory
 * and handed over on flush so a surface can send them in one beacon.
 */
export function createMeter(): Meter {
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
