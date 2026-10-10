import assert from "node:assert/strict";
import { before, test } from "node:test";
import { runtime, visit } from "../core/site.ts";

type Signal = { level: string; event: string; facts: Record<string, unknown> };

let receive: ( request: Request ) => Promise<Response>;

function beacon ( body: unknown, headers: Record<string, string> = { "sec-fetch-site": "same-origin" } ): Promise<number> {

    const request = new Request("https://shop.example.test/api/signals", {
        method: "POST",
        headers,
        body: typeof body === "string" ? body : JSON.stringify(body),
    });

    return receive(request).then(( response ) => response.status);

}
function batch ( size: number ): Signal[] {

    return Array.from({ length: size }, () => ({ level: "warn", event: "a", facts: {} }));

}
before(async () => {

    await runtime();
    receive = (await import("../../src/lib/observe/server.ts")).receiveSignals;

});
test("same-origin beacons are accepted, everything else is refused", async () => {

    visit({ headers: { "x-forwarded-for": "203.0.113.9" } });

    assert.equal(await beacon([{ level: "error", event: "error", facts: { message: "boom", path: "/x" } }]), 204);
    assert.equal(await beacon([{ level: "error", event: "error", facts: {} }], {}), 403);
    assert.equal(await beacon([{ level: "error", event: "error", facts: {} }], { origin: "https://shop.example.test" }), 204);
    assert.equal(await beacon([{ level: "error", event: "error", facts: {} }], { origin: "https://evil.example" }), 403);
    assert.equal(await beacon([{ level: "error", event: "error", facts: {} }], { "sec-fetch-site": "cross-site", origin: "https://shop.example.test" }), 403);
    assert.equal(await beacon("{bad"), 400);
    assert.equal(await beacon([]), 400);
    assert.equal(await beacon([{ level: "info", event: "x", facts: {} }]), 400);
    assert.equal(await beacon([{ level: "error", event: "Bad Event", facts: {} }]), 400);
    assert.equal(await beacon([{ level: "error", event: "x", facts: { message: "x".repeat(5000) } }]), 400);
    assert.equal(await beacon("x".repeat(20000)), 400);

});
test("each address spends sixty signals a minute", async () => {

    visit({ headers: { "x-forwarded-for": "203.0.113.10" } });

    assert.deepEqual(await Promise.all([beacon(batch(20)), beacon(batch(20)), beacon(batch(19))]), [204, 204, 204]);
    assert.equal(await beacon(batch(2)), 429);
    assert.equal(await beacon(batch(1)), 204);

    visit({ headers: { "x-forwarded-for": "203.0.113.11" } });

    assert.equal(await beacon(batch(20)), 204);

});
test("a failed render logs one line with the digest, the route and the path without its query", async () => {

    const { onRequestError } = await import("../../src/lib/observe/server.ts");
    const logged: string[] = [];
    const { error } = console;

    console.error = ( line: string ) => { logged.push(line); };

    try {

        await onRequestError(
            Object.assign(new Error("render failed", { cause: new TypeError("inner") }), { digest: "d-1" }),
            { path: "/stays?page=2", method: "GET", headers: { "x-request-id": "trace-9" } },
            { routerKind: "App Router", routePath: "/[locale]/[[...path]]", routeType: "render", renderSource: "react-server-components", revalidateReason: undefined },
        );

    }
    finally {

        console.error = error;

    }

    const [line] = logged.map(( entry ) => JSON.parse(entry) as Record<string, unknown>);

    assert.equal(logged.length, 1);
    assert.equal(line?.event, "request.failure");
    assert.equal(line?.digest, "d-1");
    assert.equal(line?.trace, "trace-9");
    assert.equal(line?.path, "/stays");
    assert.equal(line?.route, "/[locale]/[[...path]]");
    assert.equal(line?.cause, "TypeError: inner");

});
