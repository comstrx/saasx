type Globals = {
    structuredClone?: <T>( value: T ) => T;
    performance?: { now?: () => number };
    crypto?: { getRandomValues?: ( array: Uint8Array ) => Uint8Array };
    btoa?: ( text: string ) => string;
    AbortSignal?: { timeout?: ( ms: number ) => AbortSignal; any?: ( signals: AbortSignal[] ) => AbortSignal };
};

const globals = globalThis as Globals;
const digits = Array.from({ length: 64 }, ( _, index ) => {

    if ( index < 26 ) return String.fromCharCode(65 + index);
    if ( index < 52 ) return String.fromCharCode(71 + index);
    if ( index < 62 ) return String.fromCharCode(index - 4);

    return index === 62 ? "+" : "/";

}).join("");

export function clone<T> ( value: T ): T {

    return globals.structuredClone ? globals.structuredClone(value) : (JSON.parse(JSON.stringify(value)) as T);

}
export function now (): number {

    return globals.performance?.now?.() ?? Date.now();

}
export function randomBytes ( size: number ): Uint8Array {

    const bytes = new Uint8Array(size);

    if ( globals.crypto?.getRandomValues ) return globals.crypto.getRandomValues(bytes);

    for ( let index = 0; index < size; index += 1 ) bytes[index] = Math.floor(Math.random() * 256);

    return bytes;

}
export function base64 ( bytes: Uint8Array ): string {

    if ( globals.btoa ) return globals.btoa(String.fromCharCode(...bytes));

    let out = "";

    for ( let index = 0; index < bytes.length; index += 3 ) {

        const a = bytes[index] ?? 0;
        const b = bytes[index + 1];
        const c = bytes[index + 2];
        const triple = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);

        out += digits[(triple >> 18) & 63] ?? "";
        out += digits[(triple >> 12) & 63] ?? "";
        out += b === undefined ? "=" : (digits[(triple >> 6) & 63] ?? "");
        out += c === undefined ? "=" : (digits[triple & 63] ?? "");

    }

    return out;

}
export function timeoutSignal ( ms: number ): AbortSignal {

    if ( globals.AbortSignal?.timeout ) return globals.AbortSignal.timeout(ms);

    const controller = new AbortController();

    setTimeout(() => {

        controller.abort();

    }, ms);

    return controller.signal;

}
export function anySignal ( signals: AbortSignal[] ): AbortSignal {

    if ( globals.AbortSignal?.any ) return globals.AbortSignal.any(signals);

    const controller = new AbortController();

    for ( const signal of signals ) {

        if ( signal.aborted ) {

            controller.abort();

            break;

        }

        signal.addEventListener("abort", () => {

            controller.abort();

        });

    }

    return controller.signal;

}
export function sleep ( ms: number ): Promise<void> {

    return new Promise(( resolve ) => {

        setTimeout(() => {

            resolve();

        }, ms);

    });

}
