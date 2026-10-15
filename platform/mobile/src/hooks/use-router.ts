import { parseHref, type Query } from "engine/history";
import { useContext, useEffect, useSyncExternalStore } from "react";
import { BackHandler, Linking } from "react-native";
import { config } from "@/lib/spec/runtime";
import { type Entry, EntryContext, history } from "@/stores/navigation";

export type Router = {
    push: ( href: string ) => void;
    replace: ( href: string ) => void;
    navigate: ( href: string ) => void;
    tab: ( href: string ) => void;
    back: () => void;
    canGoBack: () => boolean;
    setParams: ( params: Record<string, string | undefined> ) => void;
};

const router: Router = {
    push: history.push,
    replace: history.replace,
    navigate: history.navigate,
    tab: history.tab,
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
export function useLocalSearchParams (): Query {

    return useEntry().query;

}
export function useBackButton (): void {

    useEffect(() => {

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => history.back());

        return () => subscription.remove();

    }, []);

}
export function useDeepLinks (): void {

    useEffect(() => {

        let live = true;

        void Linking.getInitialURL().then(( url ) => {

            const target = url ? parseHref(url, config.settings.app.scheme) : undefined;

            if ( live && url && target && (target.path !== "/" || Object.keys(target.query).length) ) history.reset(url);

        });

        const subscription = Linking.addEventListener("url", ({ url }) => history.navigate(url));

        return () => {

            live = false;
            subscription.remove();

        };

    }, []);

}
