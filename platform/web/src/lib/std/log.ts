import { type Json, pruned } from "./json.ts";
import { isRecord } from "./object.ts";

export type Level = "error" | "warn" | "info";
export type Facts = Readonly<Record<string, Json | undefined>>;

function clip ( value: string | undefined, size: number ): string | undefined {

    return value?.slice(0, size);

}
function issue ( value: unknown ): string[] {

    if ( !isRecord(value) || typeof value.message !== "string" ) return [];

    const path = Array.isArray(value.path) ? value.path.join(".") : "";

    return [path ? `${path}: ${value.message}` : value.message];

}
function describe ( cause: unknown ): string {

    if ( !(cause instanceof Error) ) return String(cause);

    const issues = "issues" in cause && Array.isArray(cause.issues) ? cause.issues.flatMap(issue) : [];

    return `${cause.name}: ${issues.length ? issues.join("; ") : cause.message}`;

}
function causes ( error: Error ): string | undefined {

    const found: string[] = [];

    let cause = error.cause;

    while ( cause !== undefined && found.length < 3 ) {

        found.push(describe(cause));
        cause = cause instanceof Error ? cause.cause : undefined;

    }

    return found.length ? clip(found.join(" <- "), 500) : undefined;

}
export function errorFacts ( error: unknown ): Facts {

    if ( !(error instanceof Error) ) return { message: clip(String(error), 500) };

    const digest = "digest" in error && typeof error.digest === "string" ? error.digest : undefined;

    return { error: error.name, message: clip(error.message, 500), cause: causes(error), digest, stack: clip(error.stack, 4000) };

}
export function logLine ( level: Level, event: string, facts: Facts = {} ): void {

    console[level](JSON.stringify({ level, event, at: new Date().toISOString(), ...pruned(facts) }));

}
