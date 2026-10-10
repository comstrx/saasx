import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { endpoints } from "../../src/api/features/index.ts";
import { recordWire, serializeWire } from "../core/wire.ts";
import { calls } from "./calls.ts";

const golden = fileURLToPath(new URL("./wire.json", import.meta.url));

test("every feature with calls is exercised by the golden", () => {

    const covered = new Set(calls.map(( [feature] ) => feature));
    const calling = Object.entries(endpoints).filter(( [, operations] ) => Object.keys(operations).length > 0);

    assert.deepEqual(calling.map(( [feature] ) => feature).filter(( feature ) => !covered.has(feature)), []);

});
test("the wire of the core contract matches the golden", async ( t ) => {

    t.assert.fileSnapshot(await recordWire(calls), golden, { serializers: [serializeWire] });

});
