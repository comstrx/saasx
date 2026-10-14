"use client";

import { type ReactNode, useSyncExternalStore } from "react";

const subscribe = (): (() => void) => () => {};

export function ClientOnly ({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {

    const mounted = useSyncExternalStore(subscribe, () => true, () => false);

    return mounted ? children : fallback;

}
