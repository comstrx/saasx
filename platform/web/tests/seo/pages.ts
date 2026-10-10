import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { serialize } from "../core/site.ts";
import { record } from "./cases.ts";

const golden = fileURLToPath(new URL("./pages.json", import.meta.url));

test("every page answers the metadata, the graph and the addresses of the golden", async ( t ) => {

    t.assert.fileSnapshot(await record(), golden, { serializers: [serialize] });

});
