import { Failure } from "engine/error";

export type Store = {
    get: ( key: string ) => Promise<string | null> | string | null;
    set: ( key: string, value: string ) => Promise<void> | void;
    delete: ( key: string ) => Promise<void> | void;
    keys: () => Promise<string[]> | string[];
};
export type Driver = {
    getItem: ( key: string ) => Promise<string | null> | string | null;
    setItem: ( key: string, value: string ) => Promise<void> | void;
    removeItem: ( key: string ) => Promise<void> | void;
    getAllKeys?: (() => Promise<readonly string[]> | readonly string[]) | undefined;
};
export type WebStorage = {
    getItem: ( key: string ) => string | null;
    setItem: ( key: string, value: string ) => void;
    removeItem: ( key: string ) => void;
    key: ( index: number ) => string | null;
    readonly length: number;
};
export type Codec<T> = { encode: ( value: T ) => string; decode: ( text: string ) => T | undefined };
export type Typed<T> = {
    read: ( key: string ) => Promise<T | undefined>;
    write: ( key: string, value: T ) => Promise<void>;
    remove: ( key: string ) => Promise<void>;
};

export function memoryStore (): Store {

    const entries = new Map<string, string>();

    return {
        get: ( key ) => entries.get(key) ?? null,
        set: ( key, value ) => {

            entries.set(key, value);

        },
        delete: ( key ) => {

            entries.delete(key);

        },
        keys: () => [...entries.keys()],
    };

}
export function webStore ( storage: WebStorage ): Store {

    const guard = <T>( work: () => T ): T => {

        try {

            return work();

        } catch ( error ) {

            throw new Failure("configuration", { message: "Web storage is unavailable.", cause: error });

        }

    };

    return {
        get: ( key ) => guard(() => storage.getItem(key)),
        set: ( key, value ) => guard(() => storage.setItem(key, value)),
        delete: ( key ) => guard(() => storage.removeItem(key)),
        keys: () =>
            guard(() => Array.from({ length: storage.length }, ( _, index ) => storage.key(index) ?? "").filter(Boolean)),
    };

}
export function lazyStore ( open: () => Store ): Store {

    let opened: Store | undefined;
    const inner = (): Store => {

        opened ??= open();

        return opened;

    };

    return {
        get: ( key ) => inner().get(key),
        set: ( key, value ) => inner().set(key, value),
        delete: ( key ) => inner().delete(key),
        keys: () => inner().keys(),
    };

}
export function driverStore ( driver: Driver ): Store {

    return {
        get: ( key ) => driver.getItem(key),
        set: ( key, value ) => driver.setItem(key, value),
        delete: ( key ) => driver.removeItem(key),
        keys: async () => [...((await driver.getAllKeys?.()) ?? [])],
    };

}
export function namespaced ( store: Store, prefix: string ): Store {

    const own = `${prefix}.`;

    return {
        get: ( key ) => store.get(own + key),
        set: ( key, value ) => store.set(own + key, value),
        delete: ( key ) => store.delete(own + key),
        keys: async () => (await store.keys()).filter(( key ) => key.startsWith(own)).map(( key ) => key.slice(own.length)),
    };

}
export const jsonCodec = <T>(): Codec<T> => ({
    encode: ( value ) => JSON.stringify(value),
    decode: ( text ) => {

        try {

            return JSON.parse(text) as T;

        } catch {

            return undefined;

        }

    },
});

export function typed<T> ( store: Store, codec: Codec<T> = jsonCodec<T>() ): Typed<T> {

    return {
        read: async ( key ) => {

            const text = await store.get(key);

            if ( text === null ) return undefined;

            const value = codec.decode(text);

            if ( value === undefined ) await store.delete(key);

            return value;

        },
        write: async ( key, value ) => {

            await store.set(key, codec.encode(value));

        },
        remove: async ( key ) => {

            await store.delete(key);

        },
    };

}
