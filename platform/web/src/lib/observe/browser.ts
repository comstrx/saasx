import { ApiError, type Outcome, type Report, reportOf } from "@/api/core/error";
import { errorFacts, type Facts } from "@/lib/std/log";
import { coalesce } from "@/lib/std/timing";

const endpoint = "/api/signals";
const ceiling = 20;
const slow = 3000;
const queue: Report[] = [];
const seen = new Set<string>();
const flusher = coalesce(flush, 2000);

function flush (): void {

    flusher.cancel();

    if ( queue.length ) navigator.sendBeacon(endpoint, JSON.stringify(queue.splice(0)));

}
function send ( report: Report ): void {

    const key = JSON.stringify([report.event, report.facts.call ?? report.facts.message ?? report.facts.directive]);

    if ( seen.has(key) || seen.size >= ceiling ) return;

    seen.add(key);
    queue.push({ ...report, facts: { ...report.facts, trace: document.documentElement.dataset.trace } });
    flusher.trigger();

}
function hidden (): void {

    if ( document.visibilityState === "hidden" ) flush();

}
function violated ( event: SecurityPolicyViolationEvent ): void {

    send({
        level: "warn",
        event: "csp.violation",
        facts: {
            directive: event.effectiveDirective,
            blocked: event.blockedURI,
            source: event.sourceFile,
            line: event.lineNumber,
            path: location.pathname,
        },
    });

}
export function observeCall ( outcome: Outcome ): void {

    const report = reportOf(outcome, slow);

    if ( report ) send(report);

}
export function reportError ( error: unknown, facts: Facts = {} ): void {

    if ( typeof error === "object" && error !== null && "digest" in error ) return;

    send({ level: "error", event: "error", facts: { ...errorFacts(error), ...facts, path: location.pathname } });

}
export function ignored ( error: unknown ): undefined {

    if ( !(error instanceof ApiError) ) reportError(error);

    return undefined;

}
export function watchErrors (): void {

    window.addEventListener("error", ( event ) => reportError(event.error ?? event.message));
    window.addEventListener("unhandledrejection", ( event ) => reportError(event.reason));
    document.addEventListener("securitypolicyviolation", violated);
    document.addEventListener("visibilitychange", hidden);

}
