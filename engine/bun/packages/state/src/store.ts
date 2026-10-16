import { pick } from "engine/base";
import { type Store as Persistence, typed } from "engine/storage";
import { createStore as createZustand, type StoreApi } from "zustand/vanilla";

export type Setter<S> = ( patch: Partial<S> | (( state: S ) => Partial<S>) ) => void;
export type Getter<S> = () => S;
export type Actions<S, A> = ( set: Setter<S>, get: Getter<S> ) => A;
export type Persist<S> = {
    store: Persistence;
    keys?: readonly (keyof S & string)[] | undefined;
    version?: number | undefined;
    parse?: (( saved: unknown ) => Partial<S> | undefined) | undefined;
};
export type Definition<S extends object, A extends object> = {
    name: string;
    initial: S;
    actions: Actions<S, A>;
    persist?: Persist<S> | undefined;
};
export type Status = { ready: boolean };
export type State<S, A> = S & A & Status;
export type Instance<S extends object, A extends object> = StoreApi<State<S, A>> & {
    hydrate: () => Promise<void>;
    reset: () => void;
};
export type Defined<S extends object, A extends object> = {
    name: string;
    create: () => Instance<S, A>;
};

type Saved<S> = { version: number; state: Partial<S> };

export function defineStore<S extends object, A extends object> ( definition: Definition<S, A> ): Defined<S, A> {

    const { name, initial, actions, persist } = definition;
    const version = persist?.version ?? 1;

    return {
        name,
        create: () => {

            const store = createZustand<State<S, A>>(( set, get ) => {

                const setter: Setter<S> = ( patch ) => {

                    set(( state ) => (typeof patch === "function" ? patch(state) : patch) as Partial<State<S, A>>);

                };
                const getter: Getter<S> = () => get();

                return { ...initial, ready: !persist, ...actions(setter, getter) };

            });
            const saved = persist ? typed<Saved<S>>(persist.store) : undefined;
            const keys = persist?.keys ?? (Object.keys(initial) as (keyof S & string)[]);
            let writing = false;
            let queued: Saved<S> | undefined;
            const flush = (): void => {

                if ( writing || !queued || !saved ) return;

                const next = queued;

                queued = undefined;
                writing = true;
                void saved
                    .write(name, next)
                    .catch(() => undefined)
                    .finally(() => {

                        writing = false;
                        flush();

                    });

            };

            if ( saved ) {

                store.subscribe(( state ) => {

                    if ( !state.ready ) return;

                    queued = { version, state: pick(state, keys) as Partial<S> };
                    flush();

                });

            }

            return Object.assign(store, {
                hydrate: async () => {

                    if ( persist && saved ) {

                        const found = await saved.read(name).catch(() => undefined);

                        const state = found && found.version === version ? found.state : undefined;
                        const accepted = state && persist.parse ? persist.parse(state) : state;

                        if ( accepted ) store.setState(accepted as Partial<State<S, A>>);

                    }

                    store.setState({ ready: true } as Partial<State<S, A>>);

                },
                reset: () => {

                    store.setState({ ...initial, ready: true } as Partial<State<S, A>>);

                },
            });

        },
    };

}
