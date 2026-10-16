import { isFailure } from "engine/error";
import { interpolate } from "engine/parse";
import { type Messages, messageAt } from "./messages.ts";

export function failureMessages ( error: unknown, dictionary: Messages, fallback: string ): Record<string, string> {

    if ( !isFailure(error) ) return { _form: fallback };

    const fields = new Set([...Object.keys(error.errors), ...Object.keys(error.issues)]);
    const result: Record<string, string> = {};

    for ( const field of fields ) {

        if ( field === "_form" ) continue;

        const issue = error.issues[field]?.[0];
        const rule = issue ? messageAt(dictionary, `rules.${issue.rule}`) : undefined;
        const own = messageAt(dictionary, `fields.${field}`);

        result[field] =
            (rule ? interpolate(rule, issue?.params ?? {}) : undefined) ?? own ?? error.errors[field]?.[0] ?? fallback;

    }

    if ( Object.keys(result).length ) return result;

    const reason = error.reason ? messageAt(dictionary, `reasons.${error.reason}`) : undefined;
    const code = error.code ? messageAt(dictionary, `codes.${error.code}`) : undefined;

    return { _form: reason ?? code ?? error.errors._form?.[0] ?? (error.spoken ? error.message : undefined) ?? fallback };

}
export function failureMessage ( error: unknown, dictionary: Messages, fallback: string ): string {

    return Object.values(failureMessages(error, dictionary, fallback))[0] ?? fallback;

}
