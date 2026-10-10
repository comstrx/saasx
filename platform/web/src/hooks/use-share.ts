"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/lib/providers/ui";

type Outcome = "idle" | "copied" | "failed";
type Notice = { copied: string; failed: string };

const settle = 3000;

function cancelled ( error: unknown ): boolean {

    return error instanceof DOMException && error.name === "AbortError";

}
export function useShare ( title: string, toast?: Notice ) {

    const [outcome, setOutcome] = useState<Outcome>("idle");
    const manager = Toast.useToastManager();

    useEffect(() => {

        if ( outcome === "idle" ) return;

        const timer = window.setTimeout(() => setOutcome("idle"), settle);

        return () => window.clearTimeout(timer);

    }, [outcome]);

    async function share () {

        const url = window.location.href;

        if ( typeof navigator.share === "function" ) {

            const done = await navigator.share({ title, url }).then(() => true, cancelled);

            if ( done ) return;

        }

        const copied = navigator.clipboard ? await navigator.clipboard.writeText(url).then(() => true, () => false) : false;

        if ( toast ) manager.add({ title: copied ? toast.copied : toast.failed, type: copied ? "success" : "error", timeout: settle });
        else setOutcome(copied ? "copied" : "failed");

    }

    return { outcome, share };

}
