"use client";

import { useState } from "react";

export function useCopyValue ( value: string ) {

    const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

    async function copy () {

        const copied = !!navigator.clipboard && await navigator.clipboard.writeText(value).then(() => true, () => false);

        setStatus(copied ? "copied" : "failed");

    }

    return { status, copy };

}
