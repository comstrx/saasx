"use client";

import { useEffect, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { useSite } from "@/lib/site/context";
import { authFailures, authValues, passwordRules } from "@/lib/std/auth";
import { type AuthLinks, useAuthExit } from "./use-auth-exit";

export function useReset ( token: string, links: AuthLinks ) {

    const t = useTranslations("auth");
    const { policy } = useSite();
    const check = useAction("auth", "checkToken");
    const validToken = token.length > 0 && token.length <= 4096;

    useEffect(() => { if ( validToken ) void check.run({ token }); }, [validToken, token, check.run]);
    const action = useAction("auth", "reset");
    const exit = useAuthExit(links);
    const [done, setDone] = useState(false);
    const form = useFormFields({
        initial: authValues(""),
        validate: ( values ) => Object.fromEntries(Object.entries(authFailures(values, "reset", policy)).map(( [key, rule] ) => [
            key, t(rule.key, rule.values),
        ])),
        failure: action.error, clear: action.clear,
    });
    const error = useAuthError(action.error ?? check.error);
    const invalid = !validToken || !!check.error?.errors.token || !!action.error?.errors.token;

    const checking = validToken && (check.pending || (!check.result && !check.error));

    async function submit () {

        if ( action.pending || checking || check.error || invalid || !form.check() ) return;

        const result = await action.run({ token, password: form.values.password, password_confirmation: form.values.confirm });

        if ( result ) setDone(true);

    }

    return {
        form, exit, done, submit, error, invalid, pending: action.pending, checking,
        failed: !!check.error, reload: () => { void check.run({ token }); },
        passwordHint: passwordRules(policy).map(( rule ) => t(rule.key, rule.values)).join(" "),
    };

}
