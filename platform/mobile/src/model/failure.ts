import { z } from "zod";
import { ApiError, failureOf } from "@/api/client";
import { i18n } from "@/brand/i18n";

export type Failure = ApiError;

export const notFound: Failure = new ApiError(404, "not_found", "", null);

export const isFailure = ( reason: unknown ): reason is Failure => reason instanceof ApiError;

type FailureShape = {
    code: string;
    title: string;
    body: string;
    retryable: boolean;
    offline: boolean;
    reference: string | null;
    fields: Readonly<Record<string, string>>;
};

const missing = "\u0000";

const failureTitle = ( code: string ): string =>
    i18n.t(`error.title.${ code }`, { defaultValue: i18n.t("error.title.unknown") });

const gateCopy = ( error: ApiError ): string | null => {

    for ( const field of Object.keys(error.fields ?? {}) ) {

        const named = i18n.t(`error.gate.${ field }.${ error.reason }`, { defaultValue: missing });

        if ( named !== missing ) return named;

    }

    return null;

};

export const reasonCopy = ( error: ApiError ): string | null => {

    const gated = gateCopy(error);

    if ( gated ) return gated;

    const named = i18n.t(`error.reason.${ error.reason }`, { defaultValue: missing });

    return named === missing ? null : named;

};

export const failureBody = ( error: ApiError ): string => {

    const named = reasonCopy(error);

    if ( named ) return named;

    const spoken = i18n.t(`error.body.${ error.code }`, { defaultValue: missing });

    if ( spoken !== missing ) return spoken;

    return error.message || i18n.t("error.body.unknown");

};

const owned = ( error: ApiError, only: readonly string[] ): Readonly<Record<string, string>> => {

    const entries = Object.entries(error.fields ?? {})
        .map(([ name, messages ]) => [ name, messages[0] ?? "" ] as const)
        .filter(([ name, message ]) => message.length > 0 && ( only.length === 0 || only.includes(name) ) );

    return Object.fromEntries(entries);

};

export const failureShape = ( reason: unknown, only: readonly string[] = [] ): FailureShape => {

    const error = failureOf(reason);

    return {
        code: error.code,
        title: failureTitle(error.code),
        body: failureBody(error),
        retryable: error.transient,
        offline: error.offline,
        reference: error.reference,
        fields: owned(error, only),
    };

};

export const failureText = ( reason: unknown ): string => failureBody(failureOf(reason));

const stranded = z.object({ id: z.number() });

export const strandedOrder = ( reason: unknown ): number | null => {

    const error = failureOf(reason);

    if ( error.code !== "payment_required" ) return null;

    const read = stranded.safeParse(error.data);

    return read.success ? read.data.id : null;

};

const challenged = z.object({
    destination: z.string().nullable().optional(),
    length: z.number().nullable().optional(),
    retry_after: z.number().nullable().optional(),
});

export type Challenge = {
    destination: string;
    length: number | null;
    wait: number;
};

export const challengeOf = ( reason: unknown ): Challenge | null => {

    const read = challenged.safeParse(failureOf(reason).meta);

    return read.success ? { destination: read.data.destination ?? "", length: read.data.length ?? null, wait: read.data.retry_after ?? 0 } : null;

};

export const failureNote = ( reason: unknown, field: string ): string => {

    const error = failureOf(reason);

    return error.fields?.[field]?.[0] || failureBody(error);

};
