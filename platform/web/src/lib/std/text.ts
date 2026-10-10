export type MarkupTag = "h2" | "h3" | "p" | "ul" | "ol" | "li" | "blockquote" | "strong" | "em" | "a" | "br";
export type MarkupNode = string | { key: string; tag: MarkupTag; href?: string; children: MarkupNode[] };

type Element = Exclude<MarkupNode, string>;
type Frame = Element | { key: string; tag: "root"; href?: undefined; children: MarkupNode[] };

const entities: Readonly<Record<string, string>> = { nbsp: " ", lt: "<", gt: ">", quot: "\"", amp: "&", apos: "'" };
const tags: Readonly<Record<string, MarkupTag>> = {
    h1: "h2",
    h2: "h2",
    h3: "h3",
    h4: "h3",
    h5: "h3",
    h6: "h3",
    p: "p",
    ul: "ul",
    ol: "ol",
    li: "li",
    blockquote: "blockquote",
    strong: "strong",
    b: "strong",
    em: "em",
    i: "em",
    a: "a",
    br: "br",
};
const blocks = new Set<string>(["h2", "h3", "p", "ul", "ol", "li", "blockquote"]);
const closable = new Set<string>(["p", "h2", "h3", "strong", "em", "a"]);
const containers = new Set<string>(["root", "blockquote"]);
const lists = new Set<string>(["ul", "ol"]);
const opaque = new Set(["script", "style", "template", "iframe", "noscript", "textarea", "title", "svg", "math", "object", "select"]);
const token = /<!--[\s\S]*?(?:-->|$)|<[!?][^>]*>?|<(\/?)([a-z][a-z0-9-]*)((?:"[^"<]*"|'[^'<]*'|[^'"<>])*)>|([^<]+|<)/gi;
const depth = 24;

function decode ( value: string ): string {

    return value.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]+);/gi, ( whole, code: string ) => {

        const point = code.startsWith("#x") || code.startsWith("#X") ? Number.parseInt(code.slice(2), 16) : code.startsWith("#") ? Number(code.slice(1)) : Number.NaN;

        if ( Number.isNaN(point) ) return entities[code.toLowerCase()] ?? whole;

        return point > 0 && point <= 0x10ffff && (point < 0xd800 || point > 0xdfff) ? String.fromCodePoint(point) : "�";

    });

}
function hrefOf ( attributes: string ): string | undefined {

    const found = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(attributes);
    const href = decode(found?.[1] ?? found?.[2] ?? found?.[3] ?? "").replace(/[\t\n\r]/g, "").trim();

    return /^(?:https?:\/\/|\/(?![/\\])|mailto:)/i.test(href) ? href : undefined;

}
function visible ( node: MarkupNode ): boolean {

    return typeof node === "string" ? node.trim() !== "" : node.tag !== "br" && node.children.some(visible);

}
function settle ( nodes: readonly MarkupNode[], parent: string ): MarkupNode[] {

    const settled: MarkupNode[] = [];
    let run: Element | null = null;

    for ( const node of nodes ) {

        const element = typeof node === "string" ? null : { ...node, children: settle(node.children, node.tag) };

        if ( element && blocks.has(element.tag) && !visible(element) ) continue;
        if ( lists.has(parent) ) {

            if ( element?.tag !== "li" ) {

                if ( visible(node) ) settled.push({ key: `${parent}-${settled.length}`, tag: "li", children: [element ?? node] });

                continue;

            }

        }
        if ( containers.has(parent) && !(element && blocks.has(element.tag)) ) {

            const pieces = typeof node === "string" ? node.split(/\n[ \t\r]*\n/) : [element ?? node];

            for ( const [index, piece] of pieces.entries() ) {

                if ( index > 0 ) run = null;
                if ( !run && !visible(piece) ) continue;
                if ( !run ) {

                    run = { key: `run-${settled.length}`, tag: "p", children: [] };
                    settled.push(run);

                }

                run.children.push(piece);

            }

            continue;

        }

        run = null;
        settled.push(element ?? node);

    }

    return settled;

}
export function initials ( name: string ): string {

    return name.trim().split(/\s+/).slice(0, 2).map(( part ) => part.charAt(0)).join("").toUpperCase();

}
export function plainText ( value: string | null | undefined ): string {

    return decode((value ?? "")
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
        .replace(/<\/(?:p|div|li|h[1-6])\s*>|<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, ""))
        .replace(/ /g, " ")
        .trim();

}
export function parseMarkup ( html: string | null | undefined ): MarkupNode[] {

    const root: Frame = { key: "root", tag: "root", children: [] };
    const stack: Frame[] = [root];
    const loose = new Set<Frame>();
    const current = (): Frame => stack[stack.length - 1] ?? root;
    let skipping: string | null = null;
    let serial = 0;

    for ( const [, closing, name, attributes = "", text] of (html ?? "").matchAll(token) ) {

        const lower = name?.toLowerCase() ?? "";
        const tag = tags[lower];

        if ( skipping ) {

            if ( closing && lower === skipping ) skipping = null;

            continue;

        }
        if ( text !== undefined ) {

            if ( loose.has(current()) && text.trim() ) stack.pop();

            current().children.push(decode(text));
            continue;

        }
        if ( !closing && opaque.has(lower) && !attributes.trimEnd().endsWith("/") ) {

            skipping = lower;
            continue;

        }
        if ( !tag ) continue;
        if ( tag !== "li" && loose.has(current()) ) stack.pop();
        if ( tag === "br" ) {

            current().children.push({ key: `n${serial++}`, tag, children: [] });
            continue;

        }
        if ( closing ) {

            const index = stack.findLastIndex(( frame ) => frame.tag === tag);

            if ( index > 0 ) stack.length = index;

            continue;

        }
        if ( blocks.has(tag) ) {

            while ( closable.has(current().tag) ) stack.pop();

        }
        if ( tag === "li" && current().tag === "li" ) stack.pop();
        if ( tag === "a" ) {

            const index = stack.findLastIndex(( frame ) => frame.tag === "a");

            if ( index > 0 ) stack.length = index;

        }
        if ( stack.length > depth ) continue;
        if ( tag === "li" && !lists.has(current().tag) ) {

            const list: Element = { key: `n${serial++}`, tag: "ul", children: [] };

            current().children.push(list);
            stack.push(list);
            loose.add(list);

        }

        const node: Element = { key: `n${serial++}`, tag, href: tag === "a" ? hrefOf(attributes) : undefined, children: [] };

        current().children.push(node);
        stack.push(node);

    }

    return settle(root.children, "root");

}
export function clauses ( value: string ): { key: string; number: string; title: string; body: string }[] {

    const parts = value.split(/\n{2,}/).map(( part ) => part.trim()).filter(Boolean);
    const found = parts.map(( part ) => /^(?:\d{1,3}\.\s+)?([^.\n]{2,48})\.\s+([\s\S]{12,})$/.exec(part));

    if ( parts.length < 2 || found.some(( match ) => !match) ) return [];

    return found.flatMap(( match, index ) => {

        const [, title = "", body = ""] = match ?? [];
        const number = String(index + 1);

        return title ? [{ key: `clause-${number}`, number, title, body }] : [];

    });

}
