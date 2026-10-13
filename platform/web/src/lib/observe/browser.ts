"use client";

import { createMeter, type Observer, reportOf } from "@engine/api";
import { uuid } from "@engine/base";

const slow = 3000;
const every = 60_000;
const meter = createMeter();
let watching = false;

/**
 * This page's trace: one id every api call and the realtime socket carry, so a server log, a
 * backend request id and a socket session line up under it.
 */
export const trace: string = uuid();

function beacon ( body: Record<string, unknown> ): void {

    if ( typeof navigator === "undefined" || !navigator.sendBeacon ) return;

    navigator.sendBeacon("/api/report", new Blob([JSON.stringify(body)], { type: "application/json" }));

}
/**
 * The counters gathered since the last flush, sent in one beacon: when the page hides, when it
 * unloads, and every minute while it stays.
 */
export function flushMetrics (): void {

    const metrics = meter.flush();

    if ( metrics.length ) beacon({ trace, metrics, page: location.pathname });

}
function watch (): void {

    if ( watching || typeof window === "undefined" ) return;

    watching = true;
    window.addEventListener("pagehide", flushMetrics);
    document.addEventListener("visibilitychange", () => { if ( document.visibilityState === "hidden" ) flushMetrics(); });
    window.setInterval(flushMetrics, every);

}

/**
 * What the browser tells the server about its own calls: every call counts toward the metrics,
 * failures and slow answers go at once, each as a beacon so navigation never waits on it.
 */
export const observeCall: Observer = ( outcome ) => {

    meter.record(outcome);
    watch();

    const report = reportOf(outcome, slow);

    if ( !report ) return;

    const { call, ms, request } = outcome;
    const facts = report.facts as { kind?: string; status?: number; reason?: string };

    beacon({ call, ms: Math.round(ms), trace, request, kind: facts.kind, status: facts.status, reason: facts.reason, page: location.pathname });

};
/**
 * A render failure a boundary caught, reported the same way a failed call is.
 */
export function reportError ( name: string, error: unknown ): void {

    beacon({ call: `render.${name}`, ms: 0, trace, kind: "render", reason: error instanceof Error ? error.name : "unknown", page: location.pathname });

}
