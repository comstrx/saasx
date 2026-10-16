import type { ApiSurface, Catalogue } from "engine/api";
import { isRecord, pathGet, pathSet, uuid } from "engine/base";
import { formErrors } from "engine/error";
import { type FileRef, isFileRef } from "engine/file";
import type { Route } from "engine/screen";
import type { CompiledPort } from "engine/spec";
import { failureMessages, type Messages } from "engine/translate";
import type { FieldFact } from "engine/validate";
import { useRef, useState } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { Client } from "./client.ts";
import { fillInput } from "./port.ts";
import { performWrite } from "./write.ts";

export type FormValue =
    | string
    | boolean
    | string[]
    | Record<string, string>
    | Blob
    | FileRef
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
export type Saved = Record<string, unknown> | unknown[] | null;
export type Deferred = { queued: true };
export type BoundFormOptions = {
    errors?: Messages | undefined;
    queue?: boolean | undefined;
    initial?: Record<string, unknown> | undefined;
    autosave?: number | undefined;
};
export type FormBinding = {
    useForm: ( port: CompiledPort | undefined, route: Route, options?: BoundFormOptions ) => FormState<Saved | Deferred>;
};

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
    const fresh: Pick<FormState<T>, "values" | "saved" | "errors" | "status" | "result" | "error" | "dirty"> = {
        values: start,
        saved: start,
        errors: {},
        status: "idle",
        result: undefined,
        error: undefined,
        dirty: false,
    };
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
            ...fresh,
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
                set(fresh);

            },
        };

    });

}
export function useForm<T> ( options: FormOptions<T> ): FormState<T> {

    const [store] = useState(() => createForm(options));

    return useStore(store);

}
export function fieldLabel ( labels: Readonly<Record<string, unknown>>, name: string ): string {

    const own = labels[name];

    if ( typeof own === "string" ) return own;

    const nested = pathGet(labels, name);

    return typeof nested === "string" ? nested : name;

}
export function formText ( value: FormValue ): string {

    return typeof value === "string" ? value : "";

}
export function withTranslations (
    record: Record<string, unknown> | undefined,
    translations: readonly Record<string, unknown>[],
    fields: readonly FieldFact[],
): Record<string, unknown> | undefined {

    if ( !translations.length ) return record;

    const merged: Record<string, unknown> = { ...record };

    for ( const { name } of fields.filter(( field ) => field.kind === "localized") ) {

        const spoken = translations.filter(( text ) => typeof text.locale === "string" && typeof text[name] === "string");

        merged[name] = Object.fromEntries(spoken.map(( text ) => [text.locale, text[name]]));

    }

    return merged;

}
export function localizedTexts ( value: unknown ): Record<string, string> {

    if ( !isRecord(value) || isFileRef(value) || value instanceof Blob ) return {};

    return value as Record<string, string>;

}
export function isDeferred ( result: unknown ): result is Deferred {

    return isRecord(result) && "queued" in result;

}
export function bindForm<C extends Catalogue> ( client: Client<C> ): FormBinding {

    const { locales, useLocale, useApi, useOutbox } = client;

    function useBoundForm (
        port: CompiledPort | undefined,
        route: Route,
        { errors, queue = false, initial, autosave }: BoundFormOptions = {},
    ): FormState<Saved | Deferred> {

        const current = useRef<ApiSurface>(useApi() as ApiSurface);
        const write = port?.kind === "write" ? port : undefined;
        const locale = useLocale();
        const outbox = useOutbox();

        current.current = useApi() as ApiSurface;

        return useForm<Saved | Deferred>({
            fields: write?.fields ?? [],
            locales: [...locales],
            locale,
            errors,
            initial,
            autosave,
            submit: async ( values, options ) => {

                if ( !write ) throw new Error("No write bound to this form.");

                const input = { ...fillInput(write.input, route), ...values };
                const written = await performWrite(current.current, write, input, options, queue ? outbox : undefined);

                return written.meta.source === "queued" ? { queued: true } : (written.resource as Saved);

            },
        });

    }

    return { useForm: useBoundForm };

}
