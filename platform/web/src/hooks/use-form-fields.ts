"use client";

import { useEffect, useId, useState } from "react";
import type { ApiError } from "@/api/core/error";

type Errors = Record<string, string>;
type Options<T> = { initial: T; validate: ( values: T ) => Errors; failure?: ApiError | null; clear?: () => void };

export function useFormFields<T extends Record<string, string>> ( { initial, validate, failure, clear }: Options<T> ) {

    const prefix = useId();
    const [values, setValues] = useState(initial);
    const [submitted, setSubmitted] = useState(false);
    const [local, setLocal] = useState<Errors>({});
    const remote = Object.fromEntries(Object.entries(failure?.errors ?? {}).map(( [key, messages] ) => [
        key === "password_confirmation" ? "confirm" : key, messages[0] ?? "",
    ]));
    const errors = { ...remote, ...local };

    useEffect(() => {

        if ( !failure ) return;

        const key = Object.keys(failure.errors)
            .map(( field ) => field === "password_confirmation" ? "confirm" : field === "promotion_code" ? "promotion" : field)
            .find(( field ) => document.getElementById(`${prefix}-${field}`));

        document.getElementById(key ? `${prefix}-${key}` : `${prefix}-failure`)?.focus();

    }, [failure, prefix]);

    function change ( patch: Partial<T> ) {

        const next = { ...values, ...patch };

        setValues(next);
        clear?.();

        if ( submitted ) setLocal(validate(next));

    }
    function reset ( next: T ) {

        setValues(next);
        setSubmitted(false);
        setLocal({});
        clear?.();

    }
    function check ( extra: Errors = {} ): boolean {

        const next = { ...validate(values), ...extra };
        const first = Object.keys(next)[0];

        setSubmitted(true);
        setLocal(next);

        if ( first ) requestAnimationFrame(() => document.getElementById(`${prefix}-${first}`)?.focus());

        return !first;

    }

    return { values, errors, submitted, change, reset, check, id: ( field: string ) => `${prefix}-${field}` };

}
