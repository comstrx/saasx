import { describe, expect, test } from "bun:test";
import { beaconOf, beaconShape, createMeter, createObserver, type Signal, surfaceOf } from "engine/api";
import { Failure } from "engine/error";

describe("meter", () => {

    test("counts calls, failures and time per operation and empties on flush", () => {

        const meter = createMeter();

        meter.record({ call: "products.list", ms: 120 });
        meter.record({ call: "products.list", ms: 80.4 });
        meter.record({ call: "products.save", ms: 300, error: new Failure("network") });
        expect(meter.flush()).toEqual([
            { call: "products.list", count: 2, failures: 0, ms: 200, max: 120 },
            { call: "products.save", count: 1, failures: 1, ms: 300, max: 300 },
        ]);
        expect(meter.flush()).toEqual([]);

    });
    test("an observer meters every call, speaks only reportable ones, starts watching once and names a render failure", () => {

        const sent: Signal[] = [];
        let watched = 0;
        const observer = createObserver({ trace: "t", slow: 1000, send: ( signal ) => sent.push(signal), watch: () => { watched += 1; } });

        observer.observeCall({ call: "a.list", ms: 10 });
        observer.observeCall({ call: "a.list", ms: 1500 });
        observer.reportError("table", new TypeError("x"));
        observer.flushMetrics();
        observer.flushMetrics();

        expect(watched).toBe(1);
        expect(sent.map(( signal ) => signal.kind)).toEqual(["report", "error", "metrics"]);
        expect(sent[0]?.kind === "report" && sent[0].report.event).toBe("api.slow");
        expect(sent[1]).toEqual({ kind: "error", name: "table", reason: "TypeError", trace: "t" });
        expect(sent[2]?.kind === "metrics" && sent[2].metrics[0]?.count).toBe(2);

    });

});
describe("beacons", () => {

    test("every signal becomes one beacon body the server accepts, and anything else is refused", () => {

        const failure = new Failure("http", { status: 503, reason: "server_error" });
        const report: Signal = {
            kind: "report",
            trace: "t",
            outcome: { call: "a.list", ms: 12.6, request: "r" },
            report: { level: "error", event: "api.failure", facts: { kind: "http", status: 503, reason: "server_error", error: failure } },
        };
        const metrics: Signal = { kind: "metrics", trace: "t", metrics: [{ call: "a.list", count: 2, failures: 0, ms: 30, max: 20 }] };
        const error: Signal = { kind: "error", trace: "t", name: "table", reason: "TypeError" };

        expect(beaconOf(report, "/x")).toEqual({
            call: "a.list",
            ms: 13,
            trace: "t",
            request: "r",
            kind: "http",
            status: 503,
            reason: "server_error",
            page: "/x",
        });
        expect(beaconOf(metrics, "/x")).toEqual({ trace: "t", metrics: metrics.metrics, page: "/x" });
        expect(beaconOf(error, "/x")).toEqual({ call: "render.table", ms: 0, trace: "t", kind: "render", reason: "TypeError", page: "/x" });

        for ( const signal of [report, metrics, error] ) expect(beaconShape.safeParse(beaconOf(signal, "/x")).success).toBe(true);

        expect(beaconShape.safeParse({ call: "x".repeat(101), ms: 1 }).success).toBe(false);
        expect(beaconShape.safeParse({ metrics: [{ call: "a", count: -1, failures: 0, ms: 0, max: 0 }] }).success).toBe(false);
        expect(beaconShape.safeParse("junk").success).toBe(false);

    });

});
describe("surfaces", () => {

    test("a surface over any caller answers every catalogue operation through it", async () => {

        const calls: unknown[] = [];
        const surface = surfaceOf({ items: { list: {} as never, view: {} as never } }, async ( feature, operation, input ) => {

            calls.push([feature, operation, input]);

            return { resource: feature, message: null, meta: { source: "remote" } };

        });

        expect(Object.keys(surface.items ?? {})).toEqual(["list", "view"]);
        expect((await surface.items?.view?.({ id: 1 }))?.resource).toBe("items");
        expect(calls).toEqual([["items", "view", { id: 1 }]]);

    });

});
