import type { Query } from "engine/history";
import { useContext, useEffect, useSyncExternalStore } from "react";
import { type Entry, EntryContext, history } from "@/stores/navigation";

export type Router = {
    push: ( href: string ) => void;
    replace: ( href: string ) => void;
    navigate: ( href: string ) => void;
    back: () => void;
    canGoBack: () => boolean;
    setParams: ( params: Record<string, string | undefined> ) => void;
};

const router: Router = {
    push: history.push,
    replace: history.replace,
    navigate: history.navigate,
    back: () => {

        history.back();

    },
    canGoBack: history.canGoBack,
    setParams: ( params ) => {

        const query: Query = { ...history.current().query };

        for ( const [name, value] of Object.entries(params) ) {

            if ( value === undefined ) delete query[name];
            else query[name] = value;

        }

        history.setQuery(query);

    },
};

export function useRouter (): Router {

    return router;

}
export function useEntries (): readonly Entry[] {

    return useSyncExternalStore(history.subscribe, history.entries, history.entries);

}
export function useEntry (): Entry {

    return useContext(EntryContext) ?? history.current();

}
export function usePathname (): string {

    return useEntry().path;

}
export function useSearchParams (): Query {

    return useEntry().query;

}
export function useBackKeys (): void {

    useEffect(() => {

        const pressed = ( event: KeyboardEvent ): void => {

            if ( event.altKey && event.key === "ArrowLeft" && history.canGoBack() ) history.back();

        };

        window.addEventListener("keydown", pressed);

        return () => window.removeEventListener("keydown", pressed);

    }, []);

}
