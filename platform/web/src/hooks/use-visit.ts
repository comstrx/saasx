"use client";

import { useEffect } from "react";
import { useUi } from "@/stores/provider";

function seen ( key: string ): boolean {

    try {

        return window.sessionStorage.getItem(key) !== null;

    }
    catch {

        return false;

    }

}
function remember ( key: string ): void {

    try {

        window.sessionStorage.setItem(key, "1");

    }
    catch {

        return;

    }

}
export function useVisit ( key: string, send: () => Promise<unknown> ): void {

    const token = useUi(( state ) => state.token);

    useEffect(() => {

        if ( !token || seen(key) ) return;

        remember(key);
        send().catch(() => undefined);

    }, [token, key, send]);

}
