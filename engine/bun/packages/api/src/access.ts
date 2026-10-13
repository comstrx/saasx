export type Held = { permissions: readonly string[] } | null | undefined;

export function missing ( held: Held, permissions: readonly string[] ): string[] {

    if ( !held ) return [...permissions];

    return permissions.filter(( permission ) => permission !== "user" && !held.permissions.includes(permission));

}
export function allowed ( held: Held, permissions: readonly string[] ): boolean {

    return missing(held, permissions).length === 0;

}
