
export type Directives = Readonly<Record<string, readonly (string | false | null | undefined)[]>>;

export const identifier = /^[a-zA-Z0-9_.-]{1,100}$/;

function hex ( bytes: Uint8Array ): string {

    return Array.from(bytes, ( byte ) => byte.toString(16).padStart(2, "0")).join("");

}
export function fingerprint ( value: string ): string {

    let high = 0x811c9dc5;
    let low = 0x811c9dc5 ^ value.length;

    for ( const unit of value ) {

        const code = unit.codePointAt(0) ?? 0;

        high = Math.imul(high ^ code, 0x01000193) >>> 0;
        low = Math.imul(low ^ (code >>> 8) ^ (code & 0xff), 0x01000193) >>> 0;

    }

    return `${high.toString(16).padStart(8, "0")}${low.toString(16).padStart(8, "0")}`;

}
export function uuid (): string {

    const bytes = crypto.getRandomValues(new Uint8Array(16));

    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

    const text = hex(bytes);

    return `${text.slice(0, 8)}-${text.slice(8, 12)}-${text.slice(12, 16)}-${text.slice(16, 20)}-${text.slice(20)}`;

}
export function trace ( incoming: string | null | undefined ): string {

    return incoming && identifier.test(incoming) ? incoming : uuid();

}
export function nonce ( size = 16 ): string {

    return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(size))));

}
export function contentSecurityPolicy ( directives: Directives ): string {

    return Object.entries(directives)
        .map(( [name, sources] ) => [name, ...sources.filter(( source ) => typeof source === "string" && source.length > 0)].join(" "))
        .join("; ");

}
