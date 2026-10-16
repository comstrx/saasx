import { describe, expect, test } from "bun:test";
import { createOutbox } from "engine/client";
import { Failure } from "engine/error";
import { memoryStore, type Store } from "engine/storage";

function slow ( store: Store ): Store {

    const pause = () => new Promise(( resolve ) => setTimeout(resolve, 2));

    return {
        get: async ( key ) => {

            const value = await store.get(key);

            await pause();

            return value;

        },
        set: async ( key, value ) => {

            await pause();
            await store.set(key, value);

        },
        delete: async ( key ) => {

            await pause();
            await store.delete(key);

        },
        keys: () => store.keys(),
    };

}

describe("outbox", () => {

    test("queues a write, keeps it across instances, and replays it in order until the first transient failure", async () => {

        const store = memoryStore();
        const box = createOutbox({ store, key: "writes" });

        const first = await box.add({
            feature: "account",
            operation: "locate",
            input: { latitude: 1 },
            idempotencyKey: "k1",
        });
        const second = await box.add({
            feature: "account",
            operation: "update",
            input: { name: "x" },
            idempotencyKey: "k2",
        });

        expect((await box.list()).map(( entry ) => entry.id)).toEqual([first.id, second.id]);
        expect((await createOutbox({ store, key: "writes" }).list()).length).toBe(2);

        const sent: string[] = [];
        const outcome = await box.replay(async ( entry ) => {

            sent.push(entry.idempotencyKey);

            if ( entry.idempotencyKey === "k2" ) throw new Failure("network");

        });

        expect(sent).toEqual(["k1", "k2"]);
        expect(outcome).toEqual({ sent: 1, dropped: 0, waiting: 1 });
        expect((await box.list()).map(( entry ) => entry.idempotencyKey)).toEqual(["k2"]);

    });
    test("a refusal the backend will repeat is dropped, not retried forever", async () => {

        const box = createOutbox({ store: memoryStore(), key: "writes" });

        await box.add({ feature: "a", operation: "b", input: {}, idempotencyKey: "k" });

        const dropped: string[] = [];
        const outcome = await box.replay(
            async () => {

                throw new Failure("input", { errors: { name: ["bad"] } });

            },
            ( entry, failure ) => dropped.push(`${entry.idempotencyKey}:${failure.kind}`),
        );

        expect(outcome).toEqual({ sent: 0, dropped: 1, waiting: 0 });
        expect(dropped).toEqual(["k:input"]);
        expect(await box.list()).toEqual([]);

    });

    test("writes queued at the same moment are all kept on a slow store", async () => {

        const box = createOutbox({ store: slow(memoryStore()), key: "writes" });

        await Promise.all(["k1", "k2", "k3"].map(( key ) => box.add({ feature: "a", operation: "b", input: {}, idempotencyKey: key })));

        expect((await box.list()).map(( entry ) => entry.idempotencyKey).sort()).toEqual(["k1", "k2", "k3"]);

    });
    test("a write queued while a replay runs survives the replay", async () => {

        const box = createOutbox({ store: slow(memoryStore()), key: "writes" });

        await box.add({ feature: "a", operation: "b", input: {}, idempotencyKey: "old" });

        let late: Promise<unknown> = Promise.resolve();
        const outcome = await box.replay(async () => {

            late = box.add({ feature: "a", operation: "b", input: {}, idempotencyKey: "new" });

            await new Promise(( resolve ) => setTimeout(resolve, 5));

        });

        await late;

        expect(outcome.sent).toBe(1);
        expect((await box.list()).map(( entry ) => entry.idempotencyKey)).toEqual(["new"]);

    });

});
