import { describe, expect, test } from "bun:test";
import { defineStore } from "engine/state";
import { memoryStore } from "engine/storage";

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

describe("store", () => {

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
