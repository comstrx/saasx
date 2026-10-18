import type { Features } from "engine/tooling";

export type RuntimeScreen = { access: unknown };
export type RuntimeConfig = { realtime: unknown; api: { context: { sessionCookie: string | null } } | null };

function wired ( name: string, facts: Features ): boolean {

    const manifest = facts[name];

    if ( !manifest ) return false;

    return Object.keys(manifest.ports).length > 0 || manifest.access.length > 0 || manifest.signals.length > 0;

}
export function needsRuntime ( screens: readonly RuntimeScreen[], features: readonly string[], facts: Features, config: RuntimeConfig ): boolean {

    if ( screens.some(( screen ) => screen.access !== "any") ) return true;
    if ( features.some(( name ) => wired(name, facts)) ) return true;
    if ( config.realtime !== null ) return true;

    return config.api !== null && config.api.context.sessionCookie !== null;

}
