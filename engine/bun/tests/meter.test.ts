import { describe, expect, test } from "bun:test";
import { createMeter, createObserver, type Signal } from "engine/api";
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
