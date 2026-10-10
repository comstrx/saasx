"use client";

import { useEffect, useState } from "react";
import { identity } from "@/lib/spec/config";

const key = `${identity}.welcomed`;

export function useWelcomeDialog () {

    const [open, setOpen] = useState(false);

    useEffect(() => {

        let seen = true;

        try { seen = window.localStorage.getItem(key) === "1"; }
        catch { seen = true; }

        if ( seen ) return;

        const timer = window.setTimeout(() => setOpen(true), 900);

        return () => window.clearTimeout(timer);

    }, []);

    function dismiss () {

        setOpen(false);

        try { window.localStorage.setItem(key, "1"); }
        catch { return; }

    }

    return { open, dismiss, change: ( next: boolean ) => (next ? setOpen(true) : dismiss()) };

}
