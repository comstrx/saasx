import {
    createElement,
    createContext as createReactContext,
    type ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

export type Signals = Record<string, unknown>;
export type SignalStore = StoreApi<{
    values: Signals;
    emit: ( name: string, value: unknown ) => void;
    clear: () => void;
}>;
export type SignalBinding = {
    Provider: ( props: { children: ReactNode } ) => ReactNode;
    useSignals: () => Signals;
    useSignal: <T = unknown>( name: string ) => [T | undefined, ( value: T ) => void];
};

export function createSignals (): SignalStore {

    return createStore(( set ) => ({
        values: {},
        emit: ( name, value ) => set(( state ) => ({ values: { ...state.values, [name]: value } })),
        clear: () => set({ values: {} }),
    }));

}
export function bindSignals (): SignalBinding {

    const Context = createReactContext<SignalStore | null>(null);
    const useInstance = (): SignalStore => {

        const store = useContext(Context);

        if ( !store ) throw new Error("signals: use them inside their Provider.");

        return store;

    };

    return {
        Provider: ({ children }) => {

            const [store] = useState(createSignals);

            return createElement(Context.Provider, { value: store }, children);

        },
        useSignals: () => useStore(useInstance(), ( state ) => state.values),
        useSignal: <T>( name: string ) => {

            const store = useInstance();
            const value = useStore(store, ( state ) => state.values[name] as T | undefined);
            const emit = useCallback(( next: T ) => store.getState().emit(name, next), [store, name]);

            return [value, emit];

        },
    };

}
