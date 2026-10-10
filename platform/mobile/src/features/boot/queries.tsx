import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { focusManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { type ReactNode, useEffect, useMemo } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { failureNote, failureShape } from "@/model/failure";
import { queries } from "@/query";
import { clearMarks } from "@/query/marks";
import { settled } from "@/query/saved";
import { notify } from "@/store/notice";
import { usePrefs } from "@/store/prefs";
import { useSession } from "@/store/session";
import { storage } from "@/store/storage";

const day = 86400000;

const shelf = {
    getItem: ( name: string ): string | null => {

        const held = storage.getItem(name);

        return typeof held === "string" ? held : null;

    },
    setItem: ( name: string, value: string ) => { void storage.setItem(name, value); },
    removeItem: ( name: string ) => { void storage.removeItem(name); },
};

const persister = createSyncStoragePersister({ storage: shelf, key: "queries", throttleTime: 1200, serialize: ( client ) => JSON.stringify(settled(client)) });

const shape = 7;

const keepable = new Set([ "catalogs", "categories", "contract", "vocabulary", "content", "offers", "orders", "favorites", "cart", "wallet", "account", "notifications", "chat", "coupons", "referrals", "sessions", "tickets" ]);

const transient = new Set([ "preview", "recipient", "availability", "reviews", "messages", "suggest" ]);

const keepQuery = ( queryKey: readonly unknown[] ): boolean =>
    typeof queryKey[0] === "string" && keepable.has(queryKey[0]) && !queryKey.slice(1).some(( part ) => typeof part === "string" && transient.has(part) );

const silent = new Set([ "cancelled", "unauthenticated" ]);

export function Queries ({ children }: { children: ReactNode }) {

    const language = usePrefs(( state ) => state.language );
    const currency = usePrefs(( state ) => state.currency );

    const persistOptions = useMemo(() => ({
        persister,
        maxAge: day,
        buster: `${ shape }-${ language }-${ currency }`,
        dehydrateOptions: {
            shouldDehydrateQuery: ( query: { state: { data: unknown }; queryKey: readonly unknown[] } ) =>
                query.state.data !== undefined && keepQuery(query.queryKey),
        },
    }), [ language, currency ]);

    useEffect(() => {

        const watcher = AppState.addEventListener("change", ( status: AppStateStatus ) => focusManager.setFocused(status === "active") );

        return () => watcher.remove();

    }, []);

    useEffect(() => useSession.subscribe(( state, previous ) => {

        if ( !previous.token || state.token ) return;

        queries.clear();
        clearMarks();

    }), []);

    useEffect(() => usePrefs.subscribe(( state, previous ) => {

        if ( state.language !== previous.language || state.currency !== previous.currency ) void queries.resetQueries();

    }), []);

    useEffect(() => queries.getMutationCache().subscribe(( event ) => {

        if ( event.type !== "updated" || event.action.type !== "error" ) return;

        const meta = event.mutation.meta;

        if ( meta?.quiet ) return;

        const failure = failureShape(event.action.error);

        if ( silent.has(failure.code) ) return;

        notify(meta?.field ? failureNote(event.action.error, meta.field) : failure.body);

    }), []);

    return <PersistQueryClientProvider client={queries} persistOptions={persistOptions}>{children}</PersistQueryClientProvider>;

}
