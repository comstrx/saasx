"use client";

import { useEffect } from "react";
import { useAction } from "@/hooks/use-operation";

const beat = 60000;

export function useChatPresence ( active: boolean ) {

    const ping = useAction("chat", "presence");
    const visibility = useAction("chat", "visibility");

    useEffect(() => {

        if ( !active ) return;

        const quiet = () => undefined;
        const tick = () => { if ( document.visibilityState === "visible" ) void ping.run({}).catch(quiet); };
        const change = () => { void visibility.run({ hidden: document.visibilityState === "hidden" }).catch(quiet); };
        const timer = window.setInterval(tick, beat);

        tick();
        document.addEventListener("visibilitychange", change);

        return () => {

            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", change);

        };

    }, [active, ping.run, visibility.run]);

}
