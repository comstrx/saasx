import { describe, expect, test } from "bun:test";
import { feature, get, many, resolveApi } from "engine/api";
import { bindDevice, defineClient, defineSession, deviceNote, gateOf, granted, permissionsOf } from "engine/client";
import { createDevice } from "engine/device";
import { Failure } from "engine/error";
import { bind, defineStore } from "engine/state";
import { memoryStore } from "engine/storage";
import { z } from "engine/validate";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

type Session = { token: string | null; user: { id: number } | null };

const session = ( store = memoryStore() ) =>
    defineStore({
        name: "session",
        initial: { token: null, user: null } as Session,
        actions: ( set ) => ({
            start: ( token: string, user: { id: number } ) => set({ token, user }),
            end: () => set({ token: null, user: null }),
        }),
        persist: {
            store,
            keys: ["token", "user"],
            parse: ( saved ) => (typeof (saved as Session).token === "string" ? (saved as Partial<Session>) : undefined),
        },
    });

describe("session", () => {

    test("the shared session store restores only well-shaped values", async () => {

        const store = memoryStore();
        const first = defineSession({ name: "s", store }).create();

        await first.hydrate();
        first.getState().start("t", { id: "u1", permissions: ["admin"], name: "A" });
        await new Promise(( resolve ) => setTimeout(resolve, 0));

        const second = defineSession({ name: "s", store }).create();

        await second.hydrate();
        expect(second.getState().user).toEqual({ id: "u1", permissions: ["admin"], name: "A" });

        await store.set("s", JSON.stringify({ version: 1, state: { token: "t", user: { id: 1 } } }));

        const third = defineSession({ name: "s", store }).create();

        await third.hydrate();
        expect(third.getState().token).toBeNull();

    });
    test("ending a session that was open tells its owner once, so private caches can be wiped", async () => {

        const ended: string[] = [];
        const instance = defineSession({ name: "s", store: memoryStore(), onEnd: () => ended.push("end") }).create();

        await instance.hydrate();
        instance.getState().end();
        expect(ended).toEqual([]);
        instance.getState().start("t", { id: 1, permissions: [] });
        instance.getState().end();
        instance.getState().end();
        expect(ended).toEqual(["end"]);

    });

});
describe("hydrate", () => {

    test("a storage that throws leaves the store ready with its initial state", async () => {

        const broken = {
            get: () => {

                throw new Error("no storage");

            },
            set: () => undefined,
            delete: () => undefined,
            keys: () => [],
        };
        const instance = defineSession({ name: "s", store: broken }).create();

        await instance.hydrate();
        expect(instance.getState().ready).toBe(true);
        expect(instance.getState().token).toBeNull();

    });

});
describe("client", () => {

    const doors = ( persistent = memoryStore(), session = memoryStore() ) => ({
        identity: "shop",
        endpoints: {},
        api: {
            api: { context: { spec: "shop", currency: "USD", sessionCookie: null, proxies: 0, tenant: null }, connections: {} },
            contract: { values: {}, features: {} },
        },
        locales: ["en", "ar"],
        useLocale: () => "en",
        stores: { session, persistent },
        answers: 60_000,
        site: () => ({}),
        trace: "t-1",
    }) as unknown as Parameters<typeof defineClient>[0];

    test("one call names every store after the spec, a write queued by one user is never replayed for another, and ending a session forgets its answers", async () => {

        const persistent = memoryStore();
        const client = defineClient(doors(persistent));

        expect(client.portCache).toEqual({ store: persistent, ttl: 60_000, prefix: "shop.port" });
        expect(client.live).toBeUndefined();

        await client.outboxOf(7).add({ feature: "f", operation: "o", input: {}, idempotencyKey: "k" });
        expect(await persistent.get("shop.outbox.user:7")).toContain("\"k\"");
        expect(client.outboxOf("guest")).not.toBe(client.outboxOf(null));
        expect(await client.outboxOf(8).list()).toEqual([]);
        expect(await client.outboxOf(null).list()).toEqual([]);
        expect(client.outboxOf(7)).toBe(client.outboxOf("7"));

        await persistent.set("shop.port:x", "1");

        const instance = client.sessionStore.create();

        await instance.hydrate();
        instance.getState().start("token", { id: 1, permissions: [] });
        instance.getState().end();
        await new Promise(( resolve ) => setTimeout(resolve, 0));
        expect(await persistent.get("shop.port:x")).toBeNull();

    });
    test("a screen renders on the server without reading the host; a request reads it when it leaves", async () => {

        const endpoints = { items: feature({}, { list: get("/items", {}, many(z.object({ id: z.number() }))) }) };
        const settings = { language: "en", languages: ["en"], currency: "USD", currencies: ["USD"], theme: "light", themes: ["light"] };
        const api = resolveApi(
            endpoints,
            {
                context: { spec: "shop", currency: "USD", sessionCookie: null, proxies: 0, tenant: null },
                connections: { primary: { baseUrl: "https://api.example.test" } },
            },
            {},
            { content: { name: "Shop" }, settings },
        );
        const reads: string[] = [];
        const client = defineClient({ ...doors(), endpoints, api, host: () => { reads.push("host"); return "www.shop.test"; } });
        const sent: Headers[] = [];
        const original = globalThis.fetch;
        let surface: ReturnType<typeof client.useApi> | undefined;

        const Probe = () => {

            surface = client.useApi();

            return null;

        };

        renderToString(createElement(client.session.Provider, null, createElement(Probe)));
        expect(reads).toEqual([]);

        globalThis.fetch = (async ( _url: string, init: RequestInit ) => {

            sent.push(new Headers(init.headers));

            return new Response(JSON.stringify({ status: true, data: [], meta: { request_id: "r1" } }));

        }) as unknown as typeof fetch;
        await surface?.items.list({});
        globalThis.fetch = original;
        expect(reads).toEqual(["host"]);
        expect(sent).toHaveLength(1);

    });

});
describe("client realtime", () => {

    test("realtime costs nothing until a port subscribes, and an early unsubscribe never opens a socket", async () => {

        const opened: string[] = [];
        const globals = globalThis as { WebSocket?: unknown };
        const original = globals.WebSocket;

        globals.WebSocket = class { constructor ( url: string ) { opened.push(url); } };

        const client = defineClient({
            identity: "shop",
            endpoints: {},
            api: { api: null, contract: { values: {}, features: {} } },
            locales: ["en"],
            useLocale: () => "en",
            stores: { session: memoryStore(), persistent: memoryStore() },
            answers: 1,
            site: () => ({}),
            trace: "t",
            realtime: { url: "ws://127.0.0.1:8080", key: "lab" },
        } as unknown as Parameters<typeof defineClient>[0]);

        expect(opened).toEqual([]);

        const stop = client.live?.subscribe("c", [], () => undefined);

        stop?.();
        await new Promise(( resolve ) => setTimeout(resolve, 20));
        expect(opened).toEqual([]);
        globals.WebSocket = original;

    });

});
describe("device binding", () => {

    test("a part binds its device once and every screen reads the same one", () => {

        const device = createDevice({});

        expect(bindDevice(device).useDevice()).toBe(device);

    });
    test("a device ask and its save speak one note: done, queued, refused, unsupported or failed", () => {

        const texts = { saved: "Saved", queued: "Queued", failed: "Failed", denied: "Denied", unsupported: "Unsupported", errors: {} };
        const idle = { status: "idle", queued: false } as const;
        const saved = { status: "done", result: {}, queued: false } as const;

        expect(deviceNote({ status: "idle" }, idle, texts)).toBeUndefined();
        expect(deviceNote({ status: "done", result: {} }, saved, texts)).toEqual({ text: "Saved", tone: "success" });
        expect(deviceNote({ status: "done", result: {} }, { ...saved, queued: true }, texts)).toEqual({ text: "Queued", tone: "success" });
        expect(deviceNote({ status: "done", result: "unsupported" }, idle, texts)).toEqual({ text: "Unsupported", tone: "muted" });
        expect(deviceNote({ status: "failed", error: new Failure("denied") }, idle, texts)).toEqual({ text: "Denied", tone: "danger" });
        expect(deviceNote({ status: "failed", error: new Failure("denied", { reason: "location_unsupported" }) }, idle, texts)).toEqual({
            text: "Unsupported",
            tone: "danger",
        });
        const refused = { status: "failed", error: new Failure("input", { errors: { token: ["Bad"] } }), queued: false } as const;

        expect(deviceNote({ status: "done", result: {} }, refused, texts)).toEqual({ text: "Bad", tone: "danger" });
        expect(deviceNote({ status: "failed", error: new Error("boom") }, idle, texts)).toEqual({ text: "Failed", tone: "danger" });

    });

});
describe("hook names", () => {

    test("every hook a binding or a client hands out is named use<Name>, so a compiler never mistakes it for React's use()", () => {

        const named = ( value: object ) => Object.keys(value).filter(( key ) => key.startsWith("use"));
        const binding = bind(session());
        const client = defineClient({
            identity: "shop",
            endpoints: {},
            api: { api: null, contract: { values: {}, features: {} } },
            locales: ["en"],
            useLocale: () => "en",
            stores: { session: memoryStore(), persistent: memoryStore() },
            answers: 1,
            site: () => ({}),
            trace: "t",
        } as unknown as Parameters<typeof defineClient>[0]);

        expect(named(binding)).toContain("useSelect");
        expect([...named(binding), ...named(client), ...named(client.signals)].every(( key ) => /^use[A-Z]/.test(key))).toBe(true);

    });

});
describe("access", () => {

    test("a screen's access names the permissions it asks for: none for anyone or a guest, user for a signed-in screen", () => {

        expect(permissionsOf("any")).toEqual([]);
        expect(permissionsOf("guest")).toEqual([]);
        expect(permissionsOf("user")).toEqual(["user"]);
        expect(permissionsOf(["edit_catalogs"])).toEqual(["edit_catalogs"]);

    });
    test("access is granted by session or held permission", () => {

        expect(granted(null, ["user"])).toBe(false);
        expect(granted({ permissions: [] }, ["user"])).toBe(true);
        expect(granted({ permissions: ["admin"] }, ["user", "admin"])).toBe(true);
        expect(granted({ permissions: [] }, ["admin"])).toBe(false);

    });
    test("a gate waits for the session, admits by access, keeps signed-in users off guest screens and refuses only once ready", () => {

        const user = { id: 1, permissions: ["admin"] };

        expect(gateOf({ ready: false, user: null }, ["user"], false)).toEqual({ allowed: false, refused: false });
        expect(gateOf({ ready: true, user: null }, ["user"], false)).toEqual({ allowed: false, refused: true });
        expect(gateOf({ ready: true, user }, ["admin"], false)).toEqual({ allowed: true, refused: false });
        expect(gateOf({ ready: true, user }, ["owner"], false)).toEqual({ allowed: false, refused: true });
        expect(gateOf({ ready: false, user: null }, [], true)).toEqual({ allowed: true, refused: false });
        expect(gateOf({ ready: true, user }, [], true)).toEqual({ allowed: false, refused: true });

    });

});
