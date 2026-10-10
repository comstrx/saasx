"use client";

import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { useUi } from "@/stores/provider";

export function useProfileName ( initial: string ) {

    const t = useTranslations("account");
    const command = useAction("account", "name");
    const [saved, setSaved] = useState(initial);
    const [success, setSuccess] = useState(false);
    const session = useUi(( state ) => state.session);
    const token = useUi(( state ) => state.token);
    const user = useUi(( state ) => state.user);
    const form = useFormFields({
        initial: { name: initial }, failure: command.error, clear: command.clear,
        validate: ( values ): Record<string, string> => {

            const length = values.name.trim().length;

            return length < 2 || length > 200 ? { name: t("nameInvalid") } : {};

        },
    });

    async function submit () {

        if ( command.pending || !form.check() || !token || !user ) return;

        setSuccess(false);

        const name = form.values.name.trim();
        const result = await command.run({ name });

        if ( !result ) return;

        setSaved(name);
        setSuccess(true);
        session(token, { ...user, name });
        requestAnimationFrame(() => document.getElementById(form.id("failure"))?.focus());

    }

    return {
        t, ...form, pending: command.pending, error: useAuthError(command.error),
        dirty: form.values.name.trim() !== saved, success,
        change: ( patch: { name: string } ) => { setSuccess(false); form.change(patch); },
        submit,
    };

}
