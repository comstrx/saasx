"use client";

import type { ApiSurface, RequestOptions } from "@engine/api";
import { uuid } from "@engine/base";
import { type FormState, touched, useForm as useEngineForm } from "@engine/context";
import { transient } from "@engine/error";
import { type CompiledPort, fillInput, type Route } from "@engine/spec";
import type { Messages } from "@engine/translate";
import { useRef } from "react";
import { useApi } from "@/hooks/use-api";
import { useLocale } from "@/hooks/use-locale";
import { routing } from "@/lib/spec/config";
import { outbox } from "@/stores/outbox";

export type Saved = Record<string, unknown> | unknown[] | null;
export type Queued = { queued: true };
type Options = { errors?: Messages | undefined; queue?: boolean | undefined; initial?: Record<string, unknown> | undefined; autosave?: number | undefined };

export function isQueued ( result: unknown ): result is Queued {
    return typeof result === "object" && result !== null && "queued" in result;
}

export function useForm ( port: CompiledPort | undefined, route: Route, { errors, queue = false, initial, autosave }: Options = {} ): FormState<Saved | Queued> {
    const api = useRef<ApiSurface>(useApi() as ApiSurface);
    const write = port?.kind === "write" ? port : undefined;
    const locale = useLocale();

    api.current = useApi() as ApiSurface;

    return useEngineForm<Saved | Queued>({
        fields: write?.fields ?? [],
        locales: routing.locales,
        locale,
        errors,
        initial,
        autosave,
        submit: async ( values, options: RequestOptions ) => {
            const call = write ? api.current[write.feature]?.[write.operation] : undefined;

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
