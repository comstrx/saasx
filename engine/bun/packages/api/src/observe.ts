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
