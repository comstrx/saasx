"use client";

import { type Beacon, beaconOf, createObserver } from "engine/api";
import { uuid } from "engine/base";
import { delivery } from "@/lib/spec/config";

const every = 60_000;

function beacon ( body: Beacon ): void {

    if ( delivery === "static" || typeof navigator === "undefined" || !navigator.sendBeacon ) return;

    navigator.sendBeacon("/api/report", new Blob([JSON.stringify(body)], { type: "application/json" }));

}
function watch ( flush: () => void ): void {

    if ( typeof window === "undefined" ) return;

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => { if ( document.visibilityState === "hidden" ) flush(); });
    window.setInterval(flush, every);

}

export const { trace, observeCall, flushMetrics, reportError } = createObserver({
    trace: uuid(),
    slow: 3000,
    send: ( signal ) => beacon(beaconOf(signal, location.pathname)),
    watch,
});
