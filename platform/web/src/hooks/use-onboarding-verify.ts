"use client";

import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction } from "@/hooks/use-operation";
import { type Challenge, useOtpStep } from "@/hooks/use-otp-step";
import { useUi } from "@/stores/provider";

export function useOnboardingVerify ( initial: Challenge, onVerified: () => void ) {

    const otp = useOtpStep(initial);
    const verify = useAction("auth", "verify");
    const join = useUi(( state ) => state.join);
    const [code, setCode] = useState("");
    const failure = useAuthError(verify.error);
    const resendFailure = useAuthError(otp.error);

    async function submit () {

        if ( verify.pending || code.length !== otp.challenge.length ) return;

        const result = await verify.run({ challenge_token: otp.challenge.token, otp: code });
        const reply = result?.resource;

        if ( !reply?.token || !reply.user ) return;

        join(reply.token, reply.user, "register");
        onVerified();

    }

    return {
        code, setCode, submit, challenge: otp.challenge, retry: otp.retry, resend: otp.again, resent: otp.resent,
        expired: otp.expired, pending: verify.pending || otp.resending, error: failure ?? resendFailure,
        ready: code.length === otp.challenge.length,
    };

}
