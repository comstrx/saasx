import assert from "node:assert/strict";
import { test } from "node:test";
import { expiring } from "../../src/lib/std/cache.ts";
import { memoReads, retryAfter, retryReads } from "../../src/lib/std/fetch.ts";
import { hasNextPage } from "../../src/lib/std/route.ts";

function counting () {

    const seen: string[] = [];

    const transport: typeof fetch = async ( input, init ) => {

        seen.push(`${init?.method ?? "GET"} ${String(input)}`);

        return new Response(JSON.stringify({ n: seen.length }), { headers: { "content-type": "application/json" } });

    };

    return { seen, transport };

}
test("identical reads share one request for the memo's life, bounded; writes and different headers never do", async () => {

    const { seen, transport } = counting();

    const read = memoReads(transport, 2);
    const headers = ( id: string, auth = "Bearer t" ) => ({ authorization: auth, "x-request-id": id });

    const [a, b] = await Promise.all([
        read("https://api.test/v1/x", { headers: headers("1") }),
        read("https://api.test/v1/x", { headers: headers("2") })
    ]);

    assert.deepEqual([await a.json(), await b.json()], [{ n: 1 }, { n: 1 }]);
    assert.equal((await (await read("https://api.test/v1/x", { headers: headers("3") })).json()).n, 1);
    assert.equal((await (await read("https://api.test/v1/x", { headers: headers("4", "Bearer u") })).json()).n, 2);

    await read("https://api.test/v1/x", { method: "POST" });
    await read("https://api.test/v1/x", { method: "POST" });

    assert.equal(seen.length, 4);

    await read("https://api.test/v1/y");
    await read("https://api.test/v1/z");
    await read("https://api.test/v1/x", { headers: headers("5") });

    assert.equal(seen.length, 7);

});
test("expiring memory serves within its lifetime, reloads after it and evicts the oldest key", async ( t ) => {

    t.mock.timers.enable({ apis: ["Date"] });

    let loads = 0;

    const remember = expiring<number>(1000, () => false, 2);
    const load = async () => ++loads;

    assert.equal(await remember("a", load), 1);
    assert.equal(await remember("a", load), 1);

    t.mock.timers.tick(1001);
    assert.equal(await remember("a", load), 2);

    await remember("b", load);
    await remember("c", load);

    assert.equal(await remember("a", load), 5);
    assert.equal(await remember("c", load), 4);

});
test("expiring memory forgets a transient failure and keeps a settled one", async () => {

    let loads = 0;

    const remember = expiring<number>(60000, ( error ) => error instanceof RangeError);
    const load = async () => {

        loads += 1;

        if ( loads === 1 ) throw new Error("down");
        if ( loads === 3 ) throw new RangeError("gone");

        return loads;

    };

    await assert.rejects(remember("a", load), /down/);
    assert.equal(await remember("a", load), 2);
    assert.equal(await remember("a", load), 2);
    await assert.rejects(remember("b", load), /gone/);
    await assert.rejects(remember("b", load), /gone/);
    assert.equal(loads, 3);

});
test("retry delays read seconds or HTTP dates, clamp to a day and ignore junk", () => {

    const now = Date.parse("2026-09-28T10:00:00Z");

    assert.equal(retryAfter("30", now), 30);
    assert.equal(retryAfter(" 7 ", now), 7);
    assert.equal(retryAfter("999999999", now), 86400);
    assert.equal(retryAfter(new Date(now + 90000).toUTCString(), now), 90);
    assert.equal(retryAfter("Mon, 28 Sep 2026 09:00:00 GMT", now), 0);
    assert.equal(retryAfter("soon", now), undefined);
    assert.equal(retryAfter(null, now), undefined);

});
test("pages continue only while the server says more rows exist", () => {

    assert.equal(hasNextPage({ page: 1, limit: 10, total: 25 }, 10, 10), true);
    assert.equal(hasNextPage({ page: 3, limit: 10, total: 25 }, 5, 10), false);
    assert.equal(hasNextPage({ page: 1, limit: 10, total: 25, paged: false }, 25, 10), false);
    assert.equal(hasNextPage(undefined, 10, 10), true);

});
test("reads are retried as many times as the connection allows, writes never, and a long Retry-After ends it", async () => {

    const run = async ( answers: (number | Error | "later")[], retries: number, init?: RequestInit ) => {

        const queue = [...answers];
        let attempts = 0;

        const transport: typeof fetch = async () => {

            const next = queue.shift() ?? 200;

            attempts += 1;

            if ( next instanceof Error ) throw next;

            return new Response(null, next === "later" ? { status: 503, headers: { "retry-after": "5" } } : { status: next });

        };
        const outcome = await retryReads(transport, retries, 0)("https://api.test/v1/x", init).then(( response ) => response.status, ( error: Error ) => error.message);

        return { outcome, attempts };

    };

    assert.deepEqual(await run([new Error("reset"), 502, 200], 2), { outcome: 200, attempts: 3 });
    assert.deepEqual(await run([new Error("reset"), 200], 0), { outcome: "reset", attempts: 1 });
    assert.deepEqual(await run([503, 503, 503], 1), { outcome: 503, attempts: 2 });
    assert.deepEqual(await run([new Error("reset"), 200], 3, { method: "POST" }), { outcome: "reset", attempts: 1 });
    assert.deepEqual(await run(["later", 200], 2), { outcome: 503, attempts: 1 });
    assert.deepEqual(await run([504, 500], 3), { outcome: 500, attempts: 2 });

});
test("retries never outlive the call's own deadline", async () => {

    let attempts = 0;

    const stalled: typeof fetch = ( _, init ) => new Promise(( _resolve, reject ) => {

        attempts += 1;
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });

    });
    const started = performance.now();

    await assert.rejects(retryReads(stalled, 3, 1000)("https://api.test/v1/x", { signal: AbortSignal.timeout(40) }), /timeout|abort/i);
    assert.ok(performance.now() - started < 500);
    assert.equal(attempts, 1);

});
