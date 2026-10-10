"use client";

import { useEffect, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { useOtpStep } from "@/hooks/use-otp-step";
import { useTranslations } from "@/lib/providers/intl";
import { useSite } from "@/lib/site/context";
import { authFailures, authValues, type Challenge, passwordRules } from "@/lib/std/auth";
import { type AuthLinks, useAuthExit } from "./use-auth-exit";

export function useVerification ( initial: Challenge, origin: "login" | "register" | "recover", links: AuthLinks ) {

    const t = useTranslations("auth");
    const { policy } = useSite();
    const otp = useOtpStep(initial);
    const action = useAction("auth", origin === "recover" ? "reset" : "verify");
    const exit = useAuthExit(links);
    const [done, setDone] = useState(false);
    const [unexpected, setUnexpected] = useState(false);
    const form = useFormFields({
        initial: authValues(""),
        validate: ( values ) => ({
            ...(origin === "recover" ? Object.fromEntries(Object.entries(authFailures(values, "reset", policy)).map(( [key, rule] ) => [
                key, t(rule.key, rule.values),
            ])) : {}),
            ...(values.otp.length !== otp.challenge.length ? { otp: t("otpIncomplete", { length: otp.challenge.length }) } : {}),
        }),
        failure: action.error, clear: action.clear,
    });
    const codeId = form.id("otp");

    useEffect(() => { document.getElementById(codeId)?.focus(); }, [codeId]);

    const failure = useAuthError(action.error);
    const resendFailure = useAuthError(otp.error);
    const pending = action.pending || otp.resending;
    const blocked = otp.expired || otp.challenge.locked;

    async function submit () {

        if ( pending || blocked || !form.check() ) return;

        setUnexpected(false);

        const result = await action.run({
            challenge_token: otp.challenge.token, otp: form.values.otp,
            ...(origin === "recover" ? { password: form.values.password, password_confirmation: form.values.confirm } : {}),
        });

        if ( !result ) return;

        if ( origin === "recover" ) setDone(true);
        else if ( !("token" in result.resource) || !exit.finish(result.resource, origin) ) setUnexpected(true);

    }
    async function again () {

        if ( await otp.again() ) form.change({ otp: "" });

    }

    return {
        otp, form: {
            ...form,
            errors: { ...form.errors, ...(action.error?.errors.otp ? { otp: t("otpWrong") } : {}) },
        }, pending, blocked, submit, again, done, exit,
        passwordHint: passwordRules(policy).map(( rule ) => t(rule.key, rule.values)).join(" "),
        error: unexpected || otp.invalid ? t("unavailable") : (action.error?.errors.otp && !blocked ? null : failure) ?? resendFailure,
    };

}
