"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useMounted } from "@/hooks/use-effects";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { storedPromotion } from "@/hooks/use-promotion-code";
import { useTranslations } from "@/lib/providers/intl";
import { international, phoneCountry, validPhone } from "@/lib/providers/phone";
import { useSite } from "@/lib/site/context";
import { authFailures, authValues, type Challenge, challengeOf, identityOf, passwordRules } from "@/lib/std/auth";
import { type AuthLinks, useAuthExit } from "./use-auth-exit";

type Mode = "login" | "register" | "recover";

export function useAuthForm ( mode: Mode, links: AuthLinks, country: string ) {

    const t = useTranslations("auth");
    const ready = useMounted();
    const { policy, preferences } = useSite();
    const action = useAction("auth", mode === "recover" ? "recovery" : mode);
    const exit = useAuthExit(links);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [linkSent, setLinkSent] = useState<string | null>(null);
    const [unexpected, setUnexpected] = useState(false);
    const form = useFormFields({
        initial: authValues(phoneCountry(preferences.country, country)),
        validate: ( values ) => {

            const valid = validPhone({ country: values.country, number: values.phone });
            const failures = authFailures(values, mode, policy, valid);

            return Object.fromEntries(Object.entries(failures).map(( [key, rule] ) => [key, t(rule.key, rule.values)]));

        },
        failure: action.error,
        clear: action.clear,
    });
    const error = useAuthError(action.error, mode === "login");

    const seeded = useRef(false);

    useEffect(() => {

        if ( seeded.current ) return;

        seeded.current = true;

        const code = mode === "register" ? storedPromotion() : null;

        if ( code ) form.change({ promotion: code });

    });
    const passwordHint = passwordRules(policy).map(( rule ) => t(rule.key, rule.values)).join(" ");

    async function submit () {

        if ( action.pending || !form.check() ) return;

        const values = form.values;
        const input = mode === "register" ? {
            name: values.name.trim(), email: values.email.trim(),
            phone: international({ country: values.country, number: values.phone }),
            password: values.password, password_confirmation: values.confirm,
            ...(values.promotion.trim() ? { promotion_code: values.promotion.trim() } : {}),
        } : {
            ...identityOf(values, international({ country: values.country, number: values.phone })),
            ...(mode === "login" ? { password: values.password } : {}),
        };

        setUnexpected(false);

        const result = await action.run(input);

        if ( !result ) return;
        if ( exit.finish(result.resource, mode === "register" ? "register" : "login") ) return;

        const next = challengeOf(result.resource);

        if ( next ) setChallenge(next);
        else if ( result.resource.status === "link_sent" ) setLinkSent(result.resource.destination ?? "");
        else setUnexpected(true);

        form.change({ password: "", confirm: "" });

    }

    return {
        form, submit, exit, challenge, linkSent, passwordHint, pending: action.pending || !ready,
        error: unexpected ? t("unavailable") : error,
        restart: () => { setChallenge(null); setLinkSent(null); action.clear(); },
    };

}
