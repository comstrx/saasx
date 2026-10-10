"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { onSessionRejected } from "@/api/core/invalidation";
import { useStore } from "@/lib/providers/store";
import { identity } from "@/lib/spec/config";
import { storage } from "@/lib/std/browser";
import { createUiStore, sessionReply, type UiState } from "./ui";

type Store = ReturnType<typeof createUiStore>;

const Context = createContext<Store | null>(null);
const sessionKey = `${identity}.session`;
const session = storage("session");

function restore ( store: Store ): void {

    const saved = session.read(sessionKey);

    if ( saved === undefined || saved === null ) return;

    const found = sessionReply(saved);

    if ( found ) {

        store.getState().session(found.token, found.user);
        return;

    }

    session.write(sessionKey, null);

}
function persist ( state: UiState ): void {

    session.write(sessionKey, state.token && state.user ? { token: state.token, user: state.user } : null);

}
export function StoreProvider ({ children, currency }: { children: ReactNode; currency: string }) {

    const [store] = useState(() => createUiStore(currency));

    useEffect(() => { store.getState().setCurrency(currency); }, [store, currency]);

    useEffect(() => onSessionRejected(( token ) => {

        if ( store.getState().token === token ) store.getState().session(null, null);

    }), [store]);

    useEffect(() => {

        restore(store);
        store.getState().hydrate();

        return store.subscribe(( state, previous ) => {

            if ( state.token !== previous.token || state.user !== previous.user ) persist(state);

        });

    }, [store]);

    return <Context.Provider value={store}>{children}</Context.Provider>;

}
export function useUi<T> ( selector: ( state: UiState ) => T ): T {

    const store = useContext(Context);

    if ( !store ) throw new Error("useUi requires StoreProvider.");

    return useStore(store, selector);

}
