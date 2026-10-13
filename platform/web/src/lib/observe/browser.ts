"use client";

import { type Observer, reportOf } from "@engine/api";

const slow = 3000;

/**
 * What the browser tells the server about its own calls: failures and slow answers only, sent as
 * a beacon so navigation never waits on it.
 */
export const observeCall: Observer = ( outcome ) => {

    const report = reportOf(outcome, slow);

    if ( !report || typeof navigator === "undefined" || !navigator.sendBeacon ) return;

    const { call, ms, request } = outcome;
    const facts = report.facts as { kind?: string; status?: number; reason?: string };
    const body = JSON.stringify({ call, ms: Math.round(ms), request, kind: facts.kind, status: facts.status, reason: facts.reason, page: location.pathname });

    navigator.sendBeacon("/api/report", new Blob([body], { type: "application/json" }));

};
