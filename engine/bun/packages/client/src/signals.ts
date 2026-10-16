import { bind, defineStore, type Instance } from "engine/state";
import { type ReactNode, useCallback } from "react";

export type Signals = Record<string, unknown>;
export type SignalActions = { emit: ( name: string, value: unknown ) => void; clear: () => void };
export type SignalStore = Instance<{ values: Signals }, SignalActions>;
export type SignalBinding = {
    Provider: ( props: { children: ReactNode } ) => ReactNode;
    useSignals: () => Signals;
    useSignal: <T = unknown>( name: string ) => [T | undefined, ( value: T ) => void];
};

const signals = defineStore<{ values: Signals }, SignalActions>({
    name: "signals",
    initial: { values: {} },
    actions: ( set ) => ({
        emit: ( name, value ) => set(( state ) => ({ values: { ...state.values, [name]: value } })),
        clear: () => set({ values: {} }),
    }),
});

export function createSignals (): SignalStore {

    return signals.create();

}
export function bindSignals (): SignalBinding {

    const binding = bind(signals);

    return {
        Provider: binding.Provider,
        useSignals: () => binding.useSelect(( state ) => state.values),
        useSignal: <T>( name: string ) => {

            const store = binding.useInstance();
            const value = binding.useSelect(( state ) => state.values[name] as T | undefined);
            const emit = useCallback(( next: T ) => store.getState().emit(name, next), [store, name]);

            return [value, emit];

        },
    };

}
