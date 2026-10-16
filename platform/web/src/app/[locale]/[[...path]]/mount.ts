"use client";

import views from "@spec/mount";
import { usePathname } from "next/navigation";
import { createElement, useEffect } from "react";
import type { FeatureProps } from "@/lib/spec/feature";

type Props = FeatureProps & { name: string };

const intents = ["pointerdown", "pointermove", "touchstart", "keydown", "click", "scroll"] as const;

let engaged = false;

function whenIdle ( run: () => void ): () => void {

    if ( typeof requestIdleCallback !== "function" ) {

        const timer = window.setTimeout(run, 200);

        return () => window.clearTimeout(timer);

    }

    const handle = requestIdleCallback(run);

    return () => cancelIdleCallback(handle);

}
function onIntent ( run: () => void ): () => void {

    if ( engaged ) {

        run();

        return () => undefined;

    }

    let timer = 0;
    const start = (): void => {

        engaged = true;
        stop();
        timer = window.setTimeout(run, 500);

    };
    const stop = (): void => {

        for ( const name of intents ) window.removeEventListener(name, start, true);

    };

    for ( const name of intents ) window.addEventListener(name, start, { capture: true, passive: true });

    return () => {

        stop();
        window.clearTimeout(timer);

    };

}
export function Mount ({ name, ...props }: Props) {

    const View = views[name];

    if ( !View ) throw new Error(`No client feature named ${name}.`);

    return createElement(View as never, props);

}
export function Preload () {

    const pathname = usePathname();

    useEffect(() => {

        if ( (navigator as { connection?: { saveData?: boolean } }).connection?.saveData ) return;

        let cancel = (): void => undefined;
        const warm = (): void => {

            void import("./warm").then(( module ) => module.warm(pathname)).catch(() => undefined);

        };
        const stop = onIntent(() => { cancel = whenIdle(warm); });

        return () => {

            stop();
            cancel();

        };

    }, [pathname]);

    return null;

}
