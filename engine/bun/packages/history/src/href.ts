export type Query = Record<string, string | string[]>;
export type Href = { path: string; query: Query };

function clean ( path: string ): string {

    const segments = path.split("/").filter(Boolean);

    return `/${segments.join("/")}`;

}
function decoded ( text: string ): string {

    try {

        return decodeURIComponent(text.replaceAll("+", " "));

    } catch {

        return text;

    }

}
function stripped ( href: string, scheme: string | undefined ): string {

    if ( scheme && href.startsWith(`${scheme}://`) ) return `/${href.slice(scheme.length + 3)}`;

    const remote = /^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(href);

    return remote ? href.slice(remote[0].length) : href;

}
export function parseHref ( href: string, scheme?: string ): Href {

    const local = stripped(href, scheme).split("#")[0] ?? "";
    const at = local.indexOf("?");
    const path = clean(at === -1 ? local : local.slice(0, at));
    const query: Query = {};

    for ( const pair of (at === -1 ? "" : local.slice(at + 1)).split("&") ) {

        if ( !pair ) continue;

        const split = pair.indexOf("=");
        const name = decoded(split === -1 ? pair : pair.slice(0, split));
        const value = split === -1 ? "" : decoded(pair.slice(split + 1));
        const known = query[name];

        if ( !name ) continue;

        query[name] = known === undefined ? value : [...(Array.isArray(known) ? known : [known]), value];

    }

    return { path, query };

}
export function formatHref ( href: Href ): string {

    const pairs = Object.entries(href.query).flatMap(( [name, value] ) =>
        (Array.isArray(value) ? value : [value]).map(( item ) => `${encodeURIComponent(name)}=${encodeURIComponent(item)}`),
    );

    return pairs.length ? `${href.path}?${pairs.join("&")}` : href.path;

}
