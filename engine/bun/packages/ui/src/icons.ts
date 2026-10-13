export type Icons<I> = {
    readonly names: readonly string[];
    has: (name: string) => boolean;
    get: (name: string) => I;
};

/**
 * A named icon registry over whatever an icon is to the surface (a component, a glyph, a path):
 * unknown names resolve to the fallback so a spec never renders a hole.
 */
export function createIcons<I>(set: Readonly<Record<string, I>>, fallback: I): Icons<I> {
    const names = Object.keys(set).sort();

    return {
        names,
        has: (name) => Object.hasOwn(set, name),
        get: (name) => (Object.hasOwn(set, name) ? (set[name] as I) : fallback),
    };
}
