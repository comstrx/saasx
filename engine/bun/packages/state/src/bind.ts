import { type Context, createContext, createElement, type ReactNode, useContext, useEffect, useState } from "react";
import { useStore } from "zustand";
import type { Defined, Instance, State } from "./store.ts";

export type Binding<S extends object, A extends object> = {
    Provider: ( props: { children: ReactNode } ) => ReactNode;
    useInstance: () => Instance<S, A>;
    useSelect: <T>( selector: ( state: State<S, A> ) => T ) => T;
};

export function bind<S extends object, A extends object> ( defined: Defined<S, A> ): Binding<S, A> {

    const StoreContext: Context<Instance<S, A> | null> = createContext<Instance<S, A> | null>(null);
    const useInstance = (): Instance<S, A> => {

        const instance = useContext(StoreContext);

        if ( !instance ) throw new Error(`${defined.name}: use it inside its Provider.`);

        return instance;

    };

    return {
        Provider: ({ children }) => {

            const [instance] = useState(defined.create);

            useEffect(() => {

                void instance.hydrate();

            }, [instance]);

            return createElement(StoreContext.Provider, { value: instance }, children);

        },
        useInstance,
        useSelect: ( selector ) => useStore(useInstance(), selector),
    };

}
