import { uuid } from "@engine/base";
import { formErrors } from "@engine/error";
import type { FieldFact } from "@engine/validate";
import { useState } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

export type FormValue =
    | string
    | boolean
    | Record<string, string>
    | Blob
    | { uri: string; name: string; type: string }
    | null;
export type FormValues = Record<string, FormValue>;
export type Submit<T> = (values: Record<string, unknown>, options: { idempotencyKey: string }) => Promise<T>;
export type FormOptions<T> = {
    fields: readonly FieldFact[];
    locales: readonly string[];
    locale?: string | undefined;
    submit: Submit<T>;
    initial?: Record<string, unknown> | undefined;
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
    set: (name: string, value: FormValue) => void;
    load: (record: Record<string, unknown> | undefined) => void;
    submit: () => Promise<T | undefined>;
    reset: () => void;
};
export type FormStore<T> = StoreApi<FormState<T>>;

const dateLength = 10;
const datetimeLength = 16;

function blank(field: FieldFact, locales: readonly string[]): FormValue {
    if (field.kind === "boolean") return false;
    if (field.kind === "choice") return field.required ? (field.choices?.[0] ?? "") : "";
    if (field.kind === "localized") return Object.fromEntries(locales.map((locale) => [locale, ""]));
    if (field.kind === "file") return null;

    return "";
}
function given(field: FieldFact, value: unknown, locales: readonly string[], locale: string): FormValue {
    if (value === undefined || value === null) return blank(field, locales);
    if (field.kind === "boolean") return value === true || value === "true" || value === 1;
    if (field.kind === "localized") {
        const texts =
            typeof value === "object"
                ? (value as Record<string, unknown>)
                : typeof value === "string"
                  ? { [locale]: value }
                  : {};

        return Object.fromEntries(
            locales.map((locale) => [locale, typeof texts[locale] === "string" ? (texts[locale] as string) : ""]),
        );
    }
    if (field.kind === "file") return value instanceof Blob ? value : null;
    if (typeof value === "object") return "";
    if (field.kind === "date" && typeof value === "string") return value.slice(0, dateLength);
    if (field.kind === "datetime" && typeof value === "string") return value.slice(0, datetimeLength);

    return String(value);
}
function coerce(field: FieldFact, value: FormValue): unknown {
    if (field.kind === "boolean") return value === true;
    if (field.kind === "file") return value ?? undefined;
    if (field.kind === "localized") {
        const texts = Object.entries((value ?? {}) as Record<string, string>).filter(([, text]) => text !== "");

        return texts.length ? Object.fromEntries(texts) : undefined;
    }
    if (typeof value !== "string" || value === "") return undefined;
    if (field.kind === "integer" || field.kind === "number") return Number(value);

    return value;
}
function fill(
    fields: readonly FieldFact[],
    record: Record<string, unknown>,
    locales: readonly string[],
    locale: string,
): FormValues {
    return Object.fromEntries(fields.map((field) => [field.name, given(field, record[field.name], locales, locale)]));
}
/**
 * Field errors under the fields the form shows; anything else is the form's own message.
 */
function placed(fields: readonly FieldFact[], errors: Record<string, string>): Record<string, string> {
    const known = new Set(fields.map((field) => field.name));
    const result: Record<string, string> = {};

    for (const [name, message] of Object.entries(errors)) {
        const target = known.has(name.split(".")[0] ?? name) ? (name.split(".")[0] as string) : "_form";

        result[target] = result[target] ?? message;
    }

    return result;
}
function same(a: FormValues, b: FormValues): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}
/**
 * A form over the field facts of a write port: values start blank or from a loaded record, submit
 * coerces them to what the operation takes, one idempotency key covers every retry of the same
 * values and a fresh one follows any change or success, and failures land per field.
 */
export function createForm<T>({ fields, locales, locale, submit, initial }: FormOptions<T>): FormStore<T> {
    const current = locale ?? locales[0] ?? "";
    const start = fill(fields, initial ?? {}, locales, current);
    let key = uuid();
    let keyed: FormValues | undefined;

    return createStore<FormState<T>>((set, get) => ({
        fields,
        values: start,
        saved: start,
        errors: {},
        status: "idle",
        result: undefined,
        error: undefined,
        dirty: false,
        set: (name, value) =>
            set((state) => {
                const { [name]: _gone, ...errors } = state.errors;
                const values = { ...state.values, [name]: value };

                return {
                    values,
                    errors,
                    dirty: !same(values, state.saved),
                    status: state.status === "pending" ? "pending" : "idle",
                };
            }),
        load: (record) => {
            const values = fill(fields, record ?? {}, locales, current);

            set({ values, saved: values, dirty: false, errors: {}, status: "idle", error: undefined });
        },
        submit: async () => {
            const { values } = get();

            if (!keyed || !same(keyed, values)) {
                key = uuid();
                keyed = values;
            }

            set({ status: "pending", errors: {}, error: undefined });

            try {
                const result = await submit(
                    Object.fromEntries(
                        fields.flatMap((field) => {
                            const value = coerce(field, values[field.name] ?? null);

                            return value === undefined ? [] : [[field.name, value]];
                        }),
                    ),
                    { idempotencyKey: key },
                );

                keyed = undefined;
                set({ status: "done", result, saved: get().values, dirty: false });

                return result;
            } catch (error) {
                set({ status: "failed", error, errors: placed(fields, formErrors(error, "")) });

                return undefined;
            }
        },
        reset: () => {
            keyed = undefined;
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
    }));
}
export function useForm<T>(options: FormOptions<T>): FormState<T> {
    const [store] = useState(() => createForm(options));

    return useStore(store);
}
