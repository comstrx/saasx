"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useSite } from "@/lib/site/context";
import { media } from "@/lib/std/browser";
import { useUi } from "@/stores/provider";

const subscribe = () => () => {};
const client = () => true;
const server = () => false;

export function useMounted () {

    return useSyncExternalStore(subscribe, client, server);

}
export function useMediaQuery ( query: string ): boolean {

    const source = useMemo(() => media(query), [query]);

    return useSyncExternalStore(source.subscribe, source.getSnapshot, source.getServerSnapshot);

}
export function useEffects () {

    const ready = useMounted();
    const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
    const { motion } = useSite().settings;
    const mode = useUi(( state ) => state.effects);

    return { ready, mode, enabled: ready && !reduced && motion !== "reduced" && mode === "full" };

}
