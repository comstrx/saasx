
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export function inline ( value: Json ): string {

    return JSON.stringify(value)
        .replace(/</g, "\\u003c")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");

}
export function pruned ( entries: Readonly<Record<string, Json | undefined>> ): Record<string, Json> {

    const kept = Object.entries(entries).filter(( entry ): entry is [string, Json] => entry[1] != null && entry[1] !== "");

    return Object.fromEntries(kept);

}
export function parseJson ( text: string ): unknown {

    try { return JSON.parse(text) as unknown; }
    catch { return undefined; }

}
