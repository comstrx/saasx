import { now } from "engine/base";

type Entry<T> = { value: T; expires: number };
type Pending<T> = { value: Promise<T>; expires: number };

export type Expiring<T> = {
    get: ( key: string ) => T | undefined;
    set: ( key: string, value: T, lifetime?: number ) => void;
    delete: ( key: string ) => void;
    clear: () => void;
    size: () => number;
};
export type Lru<K, V> = {
    get: ( key: K ) => V | undefined;
    set: ( key: K, value: V ) => void;
    has: ( key: K ) => boolean;
    delete: ( key: K ) => void;
    clear: () => void;
    size: () => number;
    keys: () => K[];
};
export type Dedupe<T> = ( key: string, load: () => Promise<T> ) => Promise<T>;
export type Remember<T> = ( key: string, load: () => Promise<T> ) => Promise<T>;

const sweepAbove = 500;

export function expiring<T> ( lifetime: number ): Expiring<T> {

    const entries = new Map<string, Entry<T>>();
    const sweep = ( at: number ): void => {

        if ( entries.size <= sweepAbove ) return;

        for ( const [key, entry] of entries ) if ( entry.expires <= at ) entries.delete(key);

    };

    return {
        get: ( key ) => {

            const found = entries.get(key);

            if ( !found ) return undefined;

            if ( found.expires <= now() ) {

                entries.delete(key);

                return undefined;

            }

            return found.value;

        },
        set: ( key, value, ttl = lifetime ) => {

            const at = now();

            entries.set(key, { value, expires: at + ttl });
            sweep(at);

        },
        delete: ( key ) => {

            entries.delete(key);

        },
        clear: () => {

            entries.clear();

        },
        size: () => entries.size,
    };

}
export function lru<K, V> ( capacity: number ): Lru<K, V> {

    const entries = new Map<K, V>();

    return {
        get: ( key ) => {

            if ( !entries.has(key) ) return undefined;

            const value = entries.get(key) as V;

            entries.delete(key);
            entries.set(key, value);

            return value;

        },
        set: ( key, value ) => {

            entries.delete(key);
            entries.set(key, value);

            if ( entries.size > capacity ) {

                const oldest = entries.keys().next().value;

                if ( oldest !== undefined ) entries.delete(oldest);

            }

        },
        has: ( key ) => entries.has(key),
        delete: ( key ) => {

            entries.delete(key);

        },
        clear: () => {

            entries.clear();

        },
        size: () => entries.size,
        keys: () => [...entries.keys()],
    };

}
export function dedupe<T> (): Dedupe<T> {

    const pending = new Map<string, Promise<T>>();

    return ( key, load ) => {

        const found = pending.get(key);

        if ( found ) return found;

        const value = load().finally(() => {

            pending.delete(key);

        });

        pending.set(key, value);

        return value;

    };

}
export function remember<T> ( lifetime: number, keep: ( error: unknown ) => boolean = () => false ): Remember<T> {

    const entries = new Map<string, Pending<T>>();

    return ( key, load ) => {

        const at = now();
        const found = entries.get(key);

        if ( found && found.expires > at ) return found.value;

        const value = load().catch(( error: unknown ) => {

            if ( !keep(error) ) entries.delete(key);

            throw error;

        });

        entries.set(key, { value, expires: at + lifetime });

        if ( entries.size > sweepAbove ) {

            for ( const [name, entry] of entries ) if ( entry.expires <= at ) entries.delete(name);

        }

        return value;

    };

}
