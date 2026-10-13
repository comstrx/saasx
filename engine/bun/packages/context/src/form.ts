import { pathGet, pathSet, uuid } from "@engine/base";
import { formErrors } from "@engine/error";
import { failureMessages, type Messages } from "@engine/translate";
import type { FieldFact } from "@engine/validate";
import { useState } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

export type FormValue =
    | string
    | boolean
    | string[]
    | Record<string, string>
    | Blob
    | { uri: string; name: string; type: string }
    | null;
export type FormValues = Record<string, FormValue>;
export type Submit<T> = ( values: Record<string, unknown>, options: { idempotencyKey: string } ) => Promise<T>;
export type FormOptions<T> = {
    fields: readonly FieldFact[];
    locales: readonly string[];
    locale?: string | undefined;
    errors?: Messages | undefined;
    submit: Submit<T>;
    initial?: Record<string, unknown> | undefined;

    autosave?: number | undefined;
};
export type FormState<T> = {
    fields: readonly FieldFact[];
    values: FormValues;
    saved: FormValues;
    errors: Record<string, string>;
    status: "idle" | "pending" | "done" | "failed";
    result: T | undefined;
    error: unknown;
    dirty: boolean;
    set: ( name: string, value: FormValue ) => void;
    load: ( record: Record<string, unknown> | undefined ) => void;
    submit: () => Promise<T | undefined>;
    reset: () => void;
};
export type FormStore<T> = StoreApi<FormState<T>>;

const dateLength = 10;
const datetimeLength = 16;

function blank ( field: FieldFact, locales: readonly string[] ): FormValue {

    if ( field.kind === "boolean" ) return false;

    if ( field.kind === "choice" ) return field.required ? (field.choices?.[0] ?? "") : "";

    if ( field.kind === "localized" ) return Object.fromEntries(locales.map(( locale ) => [locale, ""]));

    if ( field.kind === "file" ) return null;

    if ( field.kind === "list" ) return [];

    return "";

}
function given ( field: FieldFact, value: unknown, locales: readonly string[], locale: string ): FormValue {

    if ( value === undefined || value === null ) return blank(field, locales);

    if ( field.kind === "boolean" ) return value === true || value === "true" || value === 1;

    if ( field.kind === "localized" ) {

        const texts =
            typeof value === "object"
                ? (value as Record<string, unknown>)
                : typeof value === "string"
                  ? { [locale]: value }
                  : {};

        return Object.fromEntries(
            locales.map(( locale ) => [locale, typeof texts[locale] === "string" ? (texts[locale] as string) : ""]),
        );

    }

    if ( field.kind === "file" ) return value instanceof Blob ? value : null;

    if ( field.kind === "list" ) return Array.isArray(value) ? value.map(String) : [];

    if ( typeof value === "object" ) return "";

    if ( field.kind === "date" && typeof value === "string" ) return value.slice(0, dateLength);

    if ( field.kind === "datetime" && typeof value === "string" ) return value.slice(0, datetimeLength);

    return String(value);

}
function coerce ( field: FieldFact, value: FormValue ): unknown {

    if ( field.kind === "boolean" ) return value === true;

    if ( field.kind === "file" ) return value ?? undefined;

    if ( field.kind === "list" ) return Array.isArray(value) && value.length ? value : undefined;

    if ( field.kind === "localized" ) {

        const texts = Object.entries((value ?? {}) as Record<string, string>).filter(( [, text] ) => text !== "");

        return texts.length ? Object.fromEntries(texts) : undefined;

    }

    if ( typeof value !== "string" || value === "" ) return undefined;

    if ( field.kind === "integer" || field.kind === "number" ) return Number(value);

    return value;

}
function fill (
    fields: readonly FieldFact[],
    record: Record<string, unknown>,
    locales: readonly string[],
    locale: string,
): FormValues {

    return Object.fromEntries(
        fields.map(( field ) => [field.name, given(field, pathGet(record, field.name), locales, locale)]),
    );

}

function placed ( fields: readonly FieldFact[], errors: Record<string, string> ): Record<string, string> {

    const known = new Set(fields.map(( field ) => field.name));
    const result: Record<string, string> = {};

    for ( const [name, message] of Object.entries(errors) ) {

        const root = name.split(".")[0] ?? name;
        const target = known.has(name) ? name : known.has(root) ? root : "_form";

        result[target] = result[target] ?? message;

    }

    return result;

}
function same ( a: FormValues, b: FormValues ): boolean {

    return JSON.stringify(a) === JSON.stringify(b);

}

export function createForm<T> ({
    fields,
    locales,
    locale,
    errors,
    submit,
    initial,
    autosave,
}: FormOptions<T>): FormStore<T> {

    const current = locale ?? locales[0] ?? "";
    const start = fill(fields, initial ?? {}, locales, current);
    let key = uuid();
    let keyed: FormValues | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const quiet = () => {

        clearTimeout(timer);
        timer = undefined;

    };

    return createStore<FormState<T>>(( set, get ) => {

        const later = () => {

            if ( !autosave ) return;

            quiet();
            timer = setTimeout(() => {

                timer = undefined;

                if ( get().status !== "pending" && get().dirty ) void get().submit();

            }, autosave);

        };

        return {
            fields,
            values: start,
            saved: start,
            errors: {},
            status: "idle",
            result: undefined,
            error: undefined,
            dirty: false,
            set: ( name, value ) =>
                set(( state ) => {

                    const { [name]: _gone, ...errors } = state.errors;
                    const values = { ...state.values, [name]: value };
                    const dirty = !same(values, state.saved);

                    if ( dirty ) later();

                    return {
                        values,
                        errors,
                        dirty,
                        status: state.status === "pending" ? "pending" : "idle",
                    };

                }),
            load: ( record ) => {

                const values = fill(fields, record ?? {}, locales, current);

                quiet();
                set({ values, saved: values, dirty: false, errors: {}, status: "idle", error: undefined });

            },
            submit: async () => {

                const { values } = get();

                if ( !keyed || !same(keyed, values) ) {

                    key = uuid();
                    keyed = values;

                }

                quiet();
                set({ status: "pending", errors: {}, error: undefined });

                const payload: Record<string, unknown> = {};

                for ( const field of fields ) {

                    const value = coerce(field, values[field.name] ?? null);

                    if ( value !== undefined ) pathSet(payload, field.name, value);

                }

                try {

                    const result = await submit(payload, { idempotencyKey: key });
                    const dirty = !same(values, get().values);

                    keyed = undefined;
                    set({ status: "done", result, saved: values, dirty });

                    if ( dirty ) later();

                    return result;

                } catch ( error ) {

                    set({
                        status: "failed",
                        error,
                        errors: placed(fields, errors ? failureMessages(error, errors, "") : formErrors(error, "")),
                    });

                    return undefined;

                }

            },
            reset: () => {

                keyed = undefined;
                quiet();
                set({
                    values: start,
                    saved: start,
                    errors: {},
                    status: "idle",
                    result: undefined,
                    error: undefined,
                    dirty: false,
                });

            },
        };

    });

}
export function useForm<T> ( options: FormOptions<T> ): FormState<T> {

    const [store] = useState(() => createForm(options));

    return useStore(store);

}
