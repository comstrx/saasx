import { useStore } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

type CollectionState<T> = {
    items: T[];
};

export type Collection<T extends { id: string }> = {
    use: <S>(selector: (items: T[]) => S) => S;
    get: (id: string) => T | undefined;
    all: () => T[];
    find: (predicate: (item: T) => boolean) => T | undefined;
    has: (id: string) => boolean;
    add: (item: T) => void;
    addMany: (items: T[]) => void;
    update: (id: string, patch: Partial<T>) => void;
    remove: (id: string) => void;
    clear: () => void;
    onChange: <S>(selector: (items: T[]) => S, callback: (value: S, previous: S) => void) => () => void;
};

export function createCollection<T extends { id: string }>( name: string ): Collection<T> {

    const store = createStore<CollectionState<T>>()(
        devtools(
            subscribeWithSelector(() => ({ items: [] as T[] })),
            { name },
        ),
    );

    const upsert = ( items: T[], item: T ) => {

        if ( !items.some((existing) => existing.id === item.id) ) return [...items, item];

        return items.map((existing) => (existing.id === item.id ? item : existing));

    };

    function useCollection<S>( selector: (items: T[]) => S ): S {

        return useStore(store, (state) => selector(state.items));

    }

    return {
        use: useCollection,
        get: ( id ) => store.getState().items.find((item) => item.id === id),
        all: () => store.getState().items,
        find: ( predicate ) => store.getState().items.find(predicate),
        has: ( id ) => store.getState().items.some((item) => item.id === id),
        add: ( item ) => store.setState((state) => ({ items: upsert(state.items, item) }), false, "add"),
        addMany: ( items ) => store.setState((state) => ({ items: items.reduce(upsert, state.items) }), false, "addMany"),
        update: ( id, patch ) =>
            store.setState(
                (state) => ({ items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) }),
                false,
                "update",
            ),
        remove: ( id ) =>
            store.setState((state) => ({ items: state.items.filter((item) => item.id !== id) }), false, "remove"),
        clear: () => store.setState({ items: [] }, false, "clear"),
        onChange: ( selector, callback ) => store.subscribe((state) => selector(state.items), callback),
    };

}
