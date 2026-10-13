"use client";

import { useEffect } from "react";

/**
 * Keeps unsaved work from vanishing: the browser asks before a reload or close, and in-app
 * links ask with the given text before leaving.
 */
export function useDirtyGuard ( dirty: boolean, leave: string ): void {

    useEffect(() => {

        if ( !dirty ) return undefined;

        const beforeUnload = ( event: BeforeUnloadEvent ): void => { event.preventDefault(); };
        const beforeClick = ( event: MouseEvent ): void => {

            const target = (event.target as Element | null)?.closest("a[href]");

            if ( target && !window.confirm(leave) ) event.preventDefault();

        };

        window.addEventListener("beforeunload", beforeUnload);
        document.addEventListener("click", beforeClick, true);

        return () => {

            window.removeEventListener("beforeunload", beforeUnload);
            document.removeEventListener("click", beforeClick, true);

        };

    }, [dirty, leave]);

}
