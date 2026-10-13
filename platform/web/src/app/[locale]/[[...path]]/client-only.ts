"use client";

import { type ReactNode, useSyncExternalStore } from "react";

const subscribe = (): (() => void) => () => {};

export function ClientOnly ({ children }: { children: ReactNode }) {
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);

    return mounted ? children : null;
}
