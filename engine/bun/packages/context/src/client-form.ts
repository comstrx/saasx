import type { ApiSurface, Catalogue, RequestOptions } from "@engine/api";
import { uuid } from "@engine/base";
import { transient } from "@engine/error";
import { type CompiledPort, fillInput, type Route } from "@engine/spec";
import type { Messages } from "@engine/translate";
import { useRef } from "react";
import type { Client } from "./client.ts";
import { type FormState, useForm as useEngineForm } from "./form.ts";
import { touched } from "./touches.ts";

export type Saved = Record<string, unknown> | unknown[] | null;
export type Deferred = { queued: true };
export type FormOptions = { errors?: Messages | undefined; queue?: boolean | undefined; initial?: Record<string, unknown> | undefined; autosave?: number | undefined };
export type FormBinding = { useForm: ( port: CompiledPort | undefined, route: Route, options?: FormOptions ) => FormState<Saved | Deferred> };

export function isDeferred ( result: unknown ): result is Deferred {

    return typeof result === "object" && result !== null && "queued" in result;

}
export function bindForm<C extends Catalogue> ( client: Client<C> ): FormBinding {

    const { locales, useLocale, useApi, useOutbox } = client;

    function useForm ( port: CompiledPort | undefined, route: Route, { errors, queue = false, initial, autosave }: FormOptions = {} ): FormState<Saved | Deferred> {

        const current = useRef<ApiSurface>(useApi() as ApiSurface);
        const write = port?.kind === "write" ? port : undefined;
        const locale = useLocale();
        const outbox = useOutbox();

        current.current = useApi() as ApiSurface;

        return useEngineForm<Saved | Deferred>({
            fields: write?.fields ?? [],
            locales: [...locales],
            locale,
            errors,
            initial,
            autosave,
            submit: async ( values, options: RequestOptions ) => {

                const call = write ? current.current[write.feature]?.[write.operation] : undefined;

                if ( !call || !write ) throw new Error("No write bound to this form.");

                const input = { ...fillInput(write.input, route), ...values };
                const idempotencyKey = options.idempotencyKey ?? uuid();

                try {

                    const result = await call(input, { ...options, idempotencyKey });

                    touched(write.touches);

                    return result.resource as Saved;

                }
                catch ( error ) {

                    if ( !queue || !transient(error) ) throw error;

                    await outbox.add({ feature: write.feature, operation: write.operation, input, idempotencyKey });

                    return { queued: true };

                }

            },
        });

    }

    return { useForm };

}
