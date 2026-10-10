import assert from "node:assert/strict";
import { before, test } from "node:test";
import { answer, backend, runtime, visit } from "../core/site.ts";

type Health = { status: string; spec: string; backend?: { reachable: boolean; ms: number } };

let route: typeof import("../../src/app/api/health/route.ts");

async function probe ( deep: boolean ): Promise<{ status: number; body: Health; cache: string | null }> {

    const response = await route.GET(new Request(`https://shop.example.test/api/health${deep ? "?deep" : ""}`));

    return { status: response.status, body: await response.json() as Health, cache: response.headers.get("cache-control") };

}
before(async () => {

    await runtime();
    route = await import("../../src/app/api/health/route.ts");

});
test("liveness answers without touching the backend; a deep probe reports it and degrades to 503 when it is down", async () => {

    backend({});

    const sent = visit();
    const shallow = await probe(false);

    assert.equal(shallow.status, 200);
    assert.deepEqual(shallow.body, { status: "ok", spec: "r" });
    assert.equal(shallow.cache, "no-store");
    assert.deepEqual(sent, []);

    const down = await probe(true);

    assert.equal(down.status, 503);
    assert.equal(down.body.status, "degraded");
    assert.equal(down.body.backend?.reachable, false);

    backend({ "/v1/contract": answer({ upload_max_bytes: 1000 }) });
    visit({ later: 60000 });

    const up = await probe(true);

    assert.equal(up.status, 200);
    assert.equal(up.body.status, "ok");
    assert.equal(up.body.backend?.reachable, true);

});
