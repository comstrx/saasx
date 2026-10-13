import type { ApiSurface, RequestOptions } from "@engine/api";
import { type FormState, touched, useForm as useEngineForm } from "@engine/context";
import { type CompiledPort, fillInput, type Route } from "@engine/spec";
import { useRef } from "react";
import { useApi } from "@/hooks/use-api";
import { routing } from "@/lib/spec/config";

type Saved = Record<string, unknown> | unknown[] | null;

export function useForm ( port: CompiledPort | undefined, route: Route, initial?: Record<string, unknown> ): FormState<Saved> {

    const api = useRef<ApiSurface>(useApi() as ApiSurface);
    const write = port?.kind === "write" ? port : undefined;

    api.current = useApi() as ApiSurface;

    return useEngineForm<Saved>({
        fields: write?.fields ?? [],
        locales: routing.locales,
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
