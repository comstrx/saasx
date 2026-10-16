import { allowed, type Held } from "engine/api";
import type { Access } from "engine/spec";

export type Gate = { allowed: boolean; refused: boolean };

export function granted ( held: Held, access: readonly string[] ): boolean {

    return Boolean(held) && allowed(held, access);

}
export function gateOf ( session: { ready: boolean; user: Held }, access: readonly string[], guest: boolean ): Gate {

    const admitted = guest ? !session.ready || !session.user : session.ready && granted(session.user, access);

    return { allowed: admitted, refused: session.ready && !admitted };

}
export function permissionsOf ( access: Access ): readonly string[] {

    if ( Array.isArray(access) ) return access;

    return access === "user" ? ["user"] : [];

}
