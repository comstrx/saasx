import { describe, expect, test } from "bun:test";
import { bindDevice, defineClient, defineSession, defineStore } from "@engine/context";
import { createDevice } from "@engine/device";
import { memoryStore } from "@engine/storage";

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

describe("context", () => {

    test("a store instance acts, persists chosen keys and hydrates on a fresh instance", async () => {

        const store = memoryStore();
        const defined = session(store);
        const first = defined.create();

        await first.hydrate();
        first.getState().start("t", { id: 1 });
        await new Promise(( resolve ) => setTimeout(resolve, 0));
        expect(JSON.parse((await store.get("session")) ?? "{}")).toEqual({
            version: 1,
            state: { token: "t", user: { id: 1 } },
        });

        const second = defined.create();

        expect(second.getState().ready).toBe(false);
        await second.hydrate();
        expect(second.getState().token).toBe("t");
        second.getState().end();
        expect(second.getState().user).toBeNull();

    });
    test("a saved value the parser refuses is ignored", async () => {

        const store = memoryStore();

        await store.set("session", JSON.stringify({ version: 1, state: { token: 7, user: null } }));

        const instance = session(store).create();

        await instance.hydrate();
        expect(instance.getState().token).toBeNull();
        expect(instance.getState().ready).toBe(true);

    });

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
        api: { api: { context: { spec: "shop", currency: "USD", sessionCookie: null, proxies: 0, tenant: null }, connections: {} }, contract: { values: {}, features: {} } },
        locales: ["en", "ar"],
        useLocale: () => "en",
        stores: { session, persistent },
        answers: 60_000,
        site: () => ({}),
        trace: "t-1",
    }) as unknown as Parameters<typeof defineClient>[0];

    test("one call names every store after the spec and ending a session forgets its answers", async () => {

        const persistent = memoryStore();
        const client = defineClient(doors(persistent));

        expect(client.portCache).toEqual({ store: persistent, ttl: 60_000, prefix: "shop.port" });
        expect(client.live).toBeUndefined();

        await client.outbox.add({ feature: "f", operation: "o", input: {}, idempotencyKey: "k" });
        expect(await persistent.get("shop.outbox")).toContain("\"k\"");

        await persistent.set("shop.port:x", "1");

        const instance = client.sessionStore.create();

        await instance.hydrate();
        instance.getState().start("token", { id: 1, permissions: [] });
        instance.getState().end();
        await new Promise(( resolve ) => setTimeout(resolve, 0));
        expect(await persistent.get("shop.port:x")).toBeNull();

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

});
