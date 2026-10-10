"use client";

import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { useSite } from "@/lib/site/context";
import { authFailures, authValues, passwordRules } from "@/lib/std/auth";

export function usePasswordChange ( allowed: boolean ) {

    const t = useTranslations("accountSecurity");
    const auth = useTranslations("auth");
    const { policy } = useSite();
    const command = useAction("account", "password");
    const [logout, setLogout] = useState(true);
    const [success, setSuccess] = useState(false);
    const uncertain = !!command.error && ![400, 401, 403, 404, 422].includes(command.error.status);
    const form = useFormFields({
        initial: { old_password: "", password: "", confirm: "" }, failure: command.error, clear: command.clear,
        validate: ( values ) => {

            const errors = Object.fromEntries(Object.entries(authFailures({ ...authValues(""), ...values }, "reset", policy))
                .map(( [key, rule] ) => [key, auth(rule.key, rule.values)]));

            if ( !values.old_password ) errors.old_password = auth("required.password");
            if ( values.password && values.password === values.old_password ) errors.password = t("differentPassword");

            return errors;

        },
    });

    async function submit () {

        if ( !allowed || command.pending || !form.check() ) return;

        setSuccess(false);

        const result = await command.run({
            old_password: form.values.old_password, password: form.values.password,
            password_confirmation: form.values.confirm, logout,
        });

        if ( !result ) return;

        form.reset({ old_password: "", password: "", confirm: "" });
        setSuccess(true);
        requestAnimationFrame(() => document.getElementById(form.id("status"))?.focus());

    }

    return {
        t, ...form, logout, setLogout, submit, success, uncertain, pending: command.pending,
        error: useAuthError(command.error), disabled: !allowed || command.pending || uncertain,
        hint: passwordRules(policy).map(( rule ) => auth(rule.key, rule.values)).join(" "),
        change: ( patch: Partial<typeof form.values> ) => { setSuccess(false); form.change(patch); },
    };

}
