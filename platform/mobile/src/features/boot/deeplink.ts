import { type Href, router, useRootNavigationState } from "expo-router";
import { useEffect, useRef } from "react";
import { Linking } from "react-native";

const homes: Record<string, Href> = {
    "": "/",
    chat: "/chat",
    orders: "/orders",
    favorites: "/favorites",
    account: "/account",
    explore: "/explore",
};

export const routeOf = ( url: string ): string =>
    url.replace(/^[a-z+.-]+:\/\//i, "").split(/[?#]/)[0]?.replace(/^\/+|\/+$/g, "") ?? "";

export function useDeepLink () {

    const root = useRootNavigationState();
    const stacked = useRef(0);

    stacked.current = root?.routes?.length ?? 0;

    useEffect(() => {

        const watcher = Linking.addEventListener("url", ({ url }) => {

            const home = homes[routeOf(url)];

            if ( !home ) return;

            if ( stacked.current > 1 ) router.dismissAll();

            router.navigate(home);

        });

        return () => watcher.remove();

    }, []);

}
