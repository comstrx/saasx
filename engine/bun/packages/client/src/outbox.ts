import { type Lanes, lanes, uuid } from "engine/base";
import { Failure, isFailure, transient } from "engine/error";
import { type Store, typed } from "engine/storage";

export type Pending = {
    id: string;
    feature: string;
    operation: string;
    input: Record<string, unknown>;
    idempotencyKey: string;
    at: number;
};
export type Queued = Omit<Pending, "id" | "at">;
export type Replay = { sent: number; dropped: number; waiting: number };
export type Outbox = {
    add: ( entry: Queued ) => Promise<Pending>;
    list: () => Promise<Pending[]>;
    remove: ( id: string ) => Promise<void>;
    replay: (
        perform: ( entry: Pending ) => Promise<unknown>,
        onDrop?: ( entry: Pending, failure: Failure ) => void,
    ) => Promise<Replay>;
};

const stores = new WeakMap<Store, Lanes>();

function laneOf ( store: Store ): Lanes {

    const lane = stores.get(store) ?? lanes();

    stores.set(store, lane);

    return lane;

}
export function createOutbox ({ store, key }: { store: Store; key: string }): Outbox {

    const box = typed<Pending[]>(store);
    const lane = laneOf(store);
    const read = async (): Promise<Pending[]> => (await box.read(key)) ?? [];
    const change = ( edit: ( entries: Pending[] ) => Pending[] ): Promise<void> =>
        lane(key, async () => box.write(key, edit(await read())));
    const list = (): Promise<Pending[]> => lane(key, read);
    const remove = ( id: string ): Promise<void> => change(( entries ) => entries.filter(( entry ) => entry.id !== id));

    return {
        list,
        remove,
        add: async ( entry ) => {

            const pending: Pending = { ...entry, id: uuid(), at: Date.now() };

            await change(( entries ) => [...entries, pending]);

            return pending;

        },
        replay: async ( perform, onDrop ) => {

            const outcome: Replay = { sent: 0, dropped: 0, waiting: 0 };
            const entries = await list();

            for ( const [index, entry] of entries.entries() ) {

                try {

                    await perform(entry);
                    outcome.sent += 1;

                } catch ( error ) {

                    const failure = isFailure(error) ? error : new Failure("unknown", { cause: error });

                    if ( transient(failure) ) {

                        outcome.waiting = entries.length - index;

                        return outcome;

                    }

                    outcome.dropped += 1;
                    onDrop?.(entry, failure);

                }

                await remove(entry.id);

            }

            return outcome;

        },
    };

}
