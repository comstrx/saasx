import { describe, expect, test } from "bun:test";
import type { Features } from "engine/tooling";
import { needsRuntime } from "../tools/compile/runtime.ts";

const quiet: Features = { hello: { owner: "client", options: { text: "" }, ports: {}, access: [], signals: [] } };
const facts: Features = {
    ...quiet,
    cards: { owner: "client", options: {}, ports: { items: { kind: "list", fields: ["title"] } }, access: [], signals: [] },
    locked: { owner: "client", options: {}, ports: {}, access: ["user"], signals: [] },
    picker: { owner: "client", options: {}, ports: {}, access: [], signals: ["selected"] },
};
const open = [{ access: "any" }];
const backend = { realtime: null, api: { context: { sessionCookie: null } } };

describe("runtime gate", () => {

    test("a hello spec needs no client runtime", () => {

        expect(needsRuntime(open, ["hello"], quiet, backend)).toBe(false);
        expect(needsRuntime(open, ["hello"], quiet, { realtime: null, api: null })).toBe(false);
        expect(needsRuntime(open, ["missing"], quiet, backend)).toBe(false);

    });
    test("a gated screen, a port, an access rule or a signal switches it on", () => {

        expect(needsRuntime([{ access: "any" }, { access: "user" }], ["hello"], facts, backend)).toBe(true);
        expect(needsRuntime(open, ["hello", "cards"], facts, backend)).toBe(true);
        expect(needsRuntime(open, ["locked"], facts, backend)).toBe(true);
        expect(needsRuntime(open, ["picker"], facts, backend)).toBe(true);

    });
    test("a session cookie or a realtime channel switches it on without any feature", () => {

        expect(needsRuntime(open, [], facts, { realtime: null, api: { context: { sessionCookie: "sid" } } })).toBe(true);
        expect(needsRuntime(open, [], facts, { realtime: { url: "wss://x" }, api: null })).toBe(true);

    });

});
