"use client";

import { useEffect, useState } from "react";
import { useAction } from "@/hooks/use-operation";
import { type Challenge, challengeOf } from "@/lib/std/auth";
import { instant } from "@/lib/std/format";

export { type Challenge, challengeOf } from "@/lib/std/auth";

export function useOtpStep ( initial: Challenge ) {

    const resend = useAction("auth", "resend");
    const [challenge, setChallenge] = useState(initial);
    const [now, setNow] = useState(() => Date.now());
    const [limitedUntil, setLimitedUntil] = useState(0);
    const [resent, setResent] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const retryAt = challenge.retryAt ? instant(challenge.retryAt) : 0;
    const expiresAt = challenge.expiresAt ? instant(challenge.expiresAt) : 0;
    const retry = Math.max(0, Math.ceil((Math.max(retryAt, limitedUntil) - now) / 1000));

    useEffect(() => {

        const timer = window.setInterval(() => setNow(Date.now()), 1000);

        return () => window.clearInterval(timer);

    }, []);
    useEffect(() => {

        if ( resend.error?.retryAfter ) setLimitedUntil(Date.now() + resend.error.retryAfter * 1000);

    }, [resend.error]);

    async function again (): Promise<boolean> {

        if ( retry || resend.pending ) return false;

        setResent(false);
        setInvalid(false);

        const reply = await resend.run({ challenge_token: challenge.token });
        const next = challengeOf(reply?.resource);

        if ( next ) {

            setChallenge(next);
            setResent(next.sent);
            setNow(Date.now());

        }
        else if ( reply ) setInvalid(true);

        return !!next;

    }

    return {
        challenge, retry, again, resent, invalid, resending: resend.pending, error: resend.error,
        expired: !!expiresAt && expiresAt <= now,
    };

}
