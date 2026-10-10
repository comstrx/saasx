"use client";

import { useEffect, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useCountdown } from "@/hooks/use-countdown";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { international, typedPhone, validPhone } from "@/lib/providers/phone";
import { useSite } from "@/lib/site/context";
import { otpValue } from "@/lib/std/auth";
import { type ContactChallenge, type ContactField, contactChallenge } from "@/lib/std/contact-verification";

type Options = { field: ContactField; value?: string | null; hasPassword: boolean; country: string };

export function useContactEditor ( { field, value, hasPassword, country }: Options ) {

    const t = useTranslations("accountContact");
    const auth = useTranslations("auth");
    const { preferences } = useSite();
    const fallback = preferences.country || country;
    const initialPhone = typedPhone(field === "phone" ? value ?? "" : "", { country: fallback, number: "" });
    const [phase, setPhase] = useState<"idle" | "edit" | "verify">("idle");
    const [mode, setMode] = useState<"change" | "verify">("verify");
    const [challenge, setChallenge] = useState<ContactChallenge | null>(null);
    const [limitedUntil, setLimitedUntil] = useState(0);
    const [notice, setNotice] = useState("");
    const [invalid, setInvalid] = useState(false);
    const changing = useAction("account", field);
    const sending = useAction("account", "sendCode");
    const confirming = useAction("account", "confirm");
    const checking = useAction("auth", field === "email" ? "checkEmail" : "checkPhone");
    const failure = checking.error ?? confirming.error ?? sending.error ?? changing.error;
    const busy = checking.pending || changing.pending || sending.pending || confirming.pending;
    const uncertain = !!failure && failure.kind !== "input" && ![400, 401, 403, 404, 422, 429].includes(failure.status);
    const retry = useCountdown(Math.max(challenge?.retryAt ?? 0, limitedUntil)) ?? 0;
    const remaining = useCountdown(challenge?.expiresAt ?? null);

    function clear () {

        checking.clear();
        changing.clear();
        sending.clear();
        confirming.clear();
        setInvalid(false);
        setNotice("");

    }

    const form = useFormFields({
        initial: { value: field === "phone" ? initialPhone.number : value ?? "", country: initialPhone.country, password: "", code: "" },
        failure, clear,
        validate: ( values ): Record<string, string> => {

            const errors: Record<string, string> = {};

            if ( phase === "verify" ) {

                if ( otpValue(values.code).length !== challenge?.length ) errors.code = t("codeInvalid");

                return errors;

            }

            const phone = { country: values.country, number: values.value };
            const next = field === "phone" ? international(phone) : values.value.trim();

            if ( field === "phone" ? !validPhone(phone) : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next) ) errors.value = t("invalid");
            if ( next === value ) errors.value = t("unchanged");
            if ( hasPassword && !values.password ) errors.password = auth("required.password");

            return errors;

        },
    });

    useEffect(() => {

        if ( failure?.retryAfter ) setLimitedUntil(Date.now() + failure.retryAfter * 1000);

    }, [failure]);
    const focusId = form.id(phase === "edit" ? "value" : "code");
    const target = field === "phone"
        ? international({ country: form.values.country, number: form.values.value })
        : form.values.value.trim();

    useEffect(() => {

        if ( phase === "edit" && failure?.errors[field]?.length ) document.getElementById(focusId)?.focus();

    }, [failure, field, phase, focusId]);

    useEffect(() => {

        if ( phase !== "idle" ) requestAnimationFrame(() => document.getElementById(focusId)?.focus());

    }, [phase, focusId]);

    function finish ( message: string ) {

        form.reset({ ...form.values, password: "", code: "" });
        clear();
        setChallenge(null);
        setPhase("idle");
        setNotice(message);
        requestAnimationFrame(() => document.getElementById(form.id("status"))?.focus());

    }
    function edit () {

        clear();
        setChallenge(null);
        setMode("change");
        form.reset({
            value: field === "phone" ? initialPhone.number : value ?? "", country: initialPhone.country, password: "", code: "",
        });
        setPhase("edit");

    }
    async function send ( changingContact: boolean ) {

        if ( busy || retry ) return;
        if ( changingContact && phase === "edit" && !form.check() ) return;

        clear();
        setMode(changingContact ? "change" : "verify");

        const password = form.values.password || undefined;

        if ( changingContact && !(await checking.run(field === "email" ? { email: target } : { phone: target })) ) return;

        const result = changingContact
            ? await changing.run(field === "email" ? { email: target, password } : { phone: target, password })
            : await sending.run({ field });

        if ( !result ) return;
        if ( result.resource.verified ) return finish(t("verified"));

        const received = contactChallenge(result.resource);

        if ( !received ) {

            setInvalid(true);
            return;

        }

        form.reset({ ...form.values, code: "" });
        setChallenge(received);
        setPhase("verify");

    }
    async function confirm () {

        if ( busy || (!uncertain && remaining === 0) || !form.check() ) return;

        clear();

        const result = await confirming.run({ field, code: otpValue(form.values.code) });

        if ( result ) finish(t(mode === "change" ? "changed" : "verified"));

    }

    const error = useAuthError(failure);

    return {
        t, auth, ...form, phase, mode, challenge, busy, uncertain, locked: busy || uncertain, retry, target,
        expired: remaining === 0 && !uncertain, notice, edit, confirm,
        error: invalid ? t("invalidReply") : error,
        cancel: () => { if ( !busy && !uncertain ) finish(""); },
        send: () => send(true), verify: () => send(false), resend: () => send(mode === "change"),
        resume: () => confirming.error ? confirm() : send(!!changing.error),
    };

}
