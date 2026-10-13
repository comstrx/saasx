"use client";

import type { ApiSurface, RequestOptions } from "@engine/api";
import { type FormState, touched, useForm as useEngineForm } from "@engine/context";
import { type CompiledPort, fillInput, type Route } from "@engine/spec";
import { useRef } from "react";
import { useApi } from "@/hooks/use-api";
import { useLocale } from "@/hooks/use-locale";
import { routing } from "@/lib/spec/config";

type Saved = Record<string, unknown> | unknown[] | null;

/**
 * A form over a write port: its fields come from the port, its bound inputs (route parameters,
 * signals) ride along on submit, and one idempotency key covers every retry of the same values.
 */
export function useForm ( port: CompiledPort | undefined, route: Route, initial?: Record<string, unknown> ): FormState<Saved> {

    const api = useRef<ApiSurface>(useApi() as ApiSurface);
    const write = port?.kind === "write" ? port : undefined;
    const locale = useLocale();

    api.current = useApi() as ApiSurface;

    return useEngineForm<Saved>({
        fields: write?.fields ?? [],
        locales: routing.locales,
        locale,
        initial,
        submit: async ( values, options: RequestOptions ) => {

            const call = write ? api.current[write.feature]?.[write.operation] : undefined;

            if ( !call || !write ) throw new Error("No write bound to this form.");

            const result = await call({ ...fillInput(write.input, route), ...values }, options);

            touched(write.touches);

            return result.resource as Saved;

        },
    });

}
