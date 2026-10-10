"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ApiError } from "@/api/core/error";
import type { Confirmation } from "@/api/core/response";

type Challenge = { details: Confirmation; at: number };

export function useConfirmation ( error: ApiError | null, scope: string, locked: boolean, clear: () => void ) {

    const id = useId();
    const previous = useRef("");
    const [code, setCode] = useState("");
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const retry = challenge ? Math.max(0, Math.ceil((challenge.at + (challenge.details.retryAfter ?? 0) * 1000 - now) / 1000)) : 0;
    const expired = challenge?.details.expiresIn != null && challenge.at + challenge.details.expiresIn * 1000 <= now;

    useEffect(() => {

        if ( !error ) return;

        if ( error.confirmation ) {

            setChallenge({ details: error.confirmation, at: Date.now() });
            setNow(Date.now());
            setCode("");

        }

        requestAnimationFrame(() => document.getElementById(error.confirmation ? id : `${id}-failure`)?.focus());

    }, [error, id]);
    useEffect(() => {

        if ( !challenge ) return;

        const timer = window.setInterval(() => setNow(Date.now()), 1000);

        return () => window.clearInterval(timer);

    }, [challenge]);
    useEffect(() => {

        if ( locked || previous.current === scope ) return;

        previous.current = scope;
        setChallenge(null);
        setCode("");
        clear();

    }, [scope, clear, locked]);

    return { id, code, setCode, challenge: challenge?.details, retry, expired };

}
