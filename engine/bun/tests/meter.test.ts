import { describe, expect, test } from "bun:test";
import { createMeter } from "@engine/api";
import { Failure } from "@engine/error";

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

});
