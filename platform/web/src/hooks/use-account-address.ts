"use client";

import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useCountryOptions } from "@/hooks/use-country-options";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { type AccountPlace, type AddressDraft, accountAddress, addressChanges, addressErrors } from "@/lib/std/account";

export function useAccountAddress ( initial: AccountPlace | null | undefined ) {

    const t = useTranslations("account");
    const countries = useCountryOptions(useLocale());
    const command = useAction("account", "location");
    const [saved, setSaved] = useState(() => accountAddress(initial));
    const [success, setSuccess] = useState(false);
    const form = useFormFields({
        initial: saved, failure: command.error, clear: command.clear,
        validate: ( values ) => addressErrors(values, saved, t("addressInvalid")),
    });
    const dirty = Object.keys(addressChanges(form.values, saved)).length > 0;

    async function submit () {

        if ( command.pending || !dirty || !form.check() ) return;

        setSuccess(false);

        const result = await command.run(addressChanges(form.values, saved));

        if ( !result ) return;

        const next = accountAddress(result.resource.geo);

        setSaved(next);
        form.change(next);
        setSuccess(true);
        requestAnimationFrame(() => document.getElementById(form.id("failure"))?.focus());

    }

    return {
        t, ...form, dirty, success,
        countries: [
            { value: "", label: t("chooseCountry") },
            ...(!countries.some(( item ) => item.value === form.values.country) && form.values.country
                ? [{ value: form.values.country, label: form.values.country }] : []),
            ...countries,
        ], pending: command.pending, error: useAuthError(command.error), submit,
        change: ( patch: Partial<AddressDraft> ) => { setSuccess(false); form.change(patch); },
    };

}
