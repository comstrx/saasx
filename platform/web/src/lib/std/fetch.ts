import { keep } from "./cache.ts";
import { delay } from "./timing.ts";

export type Transport = ( input: URL | RequestInfo, init?: RequestInit ) => Promise<Response>;

const day = 86400;
const unstable = [502, 503, 504];

export function status ( code: number ): Response {

    return new Response(null, { status: code });

}
export function retryAfter ( header: string | null, now = Date.now() ): number | undefined {

    const value = header?.trim();

    if ( !value ) return undefined;
    if ( /^\d+$/.test(value) ) return Math.min(Number(value), day);

    const at = Date.parse(value);

    return Number.isNaN(at) ? undefined : Math.min(Math.max(0, Math.ceil((at - now) / 1000)), day);

}
function reads ( init?: RequestInit ): boolean {

    return (init?.method ?? "GET").toUpperCase() === "GET";

}
function jitter ( pause: number ): number {

    return pause + Math.random() * pause;

}
export function retryReads ( transport: Transport, retries = 1, pause = 150, patience = 2000 ): Transport {

    return async ( input, init ) => {

        for ( let attempt = 0; ; attempt += 1 ) {

            const retry = attempt < retries && reads(init) && !init?.signal?.aborted;

            let response: Response;

            try {

                response = await transport(input, init);

            }
            catch ( error ) {

                if ( !retry ) throw error;

                await delay(jitter(pause * 2 ** attempt), init?.signal ?? undefined);
                continue;

            }

            if ( !retry || !unstable.includes(response.status) ) return response;

            const wait = (retryAfter(response.headers.get("retry-after")) ?? 0) * 1000;

            if ( wait > patience ) return response;

            await response.body?.cancel();
            await delay(Math.max(wait, jitter(pause * 2 ** attempt)), init?.signal ?? undefined);

        }

    };

}
function forget ( pending: Map<string, Promise<Response>>, key: string, shared: Promise<Response> ): void {

    if ( pending.get(key) === shared ) pending.delete(key);

}
export function memoReads ( transport: Transport, capacity = 200, ignored: readonly string[] = ["x-request-id"] ): Transport {

    const pending = new Map<string, Promise<Response>>();

    return ( input, init ) => {

        if ( !reads(init) ) return transport(input, init);

        const url = input instanceof Request ? input.url : String(input);
        const headers = [...new Headers(init?.headers)].filter(( [name] ) => !ignored.includes(name));
        const key = JSON.stringify([url, headers]);
        const shared = pending.get(key) ?? transport(input, init);

        keep(pending, key, shared, capacity);
        shared.then(( response ) => { if ( response.status >= 500 ) forget(pending, key, shared); }, () => forget(pending, key, shared));

        return shared.then(( response ) => response.clone());

    };

}
export async function readText ( stream: ReadableStream<Uint8Array>, limit: number ): Promise<string> {

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    let size = 0;
    let text = "";

    try {

        while ( true ) {

            const { done, value } = await reader.read();

            if ( done ) return text + decoder.decode();

            size += value.byteLength;

            if ( size > limit ) {

                await reader.cancel();
                throw new RangeError("The stream exceeds its size limit.");

            }

            text += decoder.decode(value, { stream: true });

        }

    }
    finally {

        reader.releaseLock();

    }

}
export async function readBody ( stream: ReadableStream<Uint8Array> | null, limit: number ): Promise<string | undefined> {

    if ( !stream ) return "";

    try { return await readText(stream, limit); }
    catch { return undefined; }

}
