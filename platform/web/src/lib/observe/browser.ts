"use client";

import { createObserver, type Signal } from "engine/api";
import { uuid } from "engine/base";

const every = 60_000;

function beacon ( body: Record<string, unknown> ): void {

    if ( typeof navigator === "undefined" || !navigator.sendBeacon ) return;

    navigator.sendBeacon("/api/report", new Blob([JSON.stringify(body)], { type: "application/json" }));

}
function body ( signal: Signal, page: string ): Record<string, unknown> {

    if ( signal.kind === "metrics" ) return { trace: signal.trace, metrics: signal.metrics, page };
    if ( signal.kind === "error" ) return { call: `render.${signal.name}`, ms: 0, trace: signal.trace, kind: "render", reason: signal.reason, page };

    const { call, ms, request } = signal.outcome;
    const facts = signal.report.facts as { kind?: string; status?: number; reason?: string };

    return { call, ms: Math.round(ms), trace: signal.trace, request, kind: facts.kind, status: facts.status, reason: facts.reason, page };

}
function watch ( flush: () => void ): void {

    if ( typeof window === "undefined" ) return;

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => { if ( document.visibilityState === "hidden" ) flush(); });
    window.setInterval(flush, every);

}

export const { trace, observeCall, flushMetrics, reportError } = createObserver({ trace: uuid(), slow: 3000, send: ( signal ) => beacon(body(signal, location.pathname)), watch });
