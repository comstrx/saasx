import { type Lanes, lanes } from "engine/base";
import { lru } from "engine/cache";
import { type Store, typed } from "engine/storage";

export type PortCache = { store: Store; ttl: number; prefix?: string | undefined; limit?: number | undefined };
export type PortMemory = { seed: () => unknown | Promise<unknown>; keep: ( value: unknown ) => void };

type Cached = { at: number; value: unknown };

const storeLimit = 100;
const memory = lru<string, Cached>(300);
const lane: Lanes = lanes();

async function sweep ( store: Store, prefix: string, keep: ( key: string ) => boolean ): Promise<void> {

    for ( const key of await store.keys() ) if ( key.startsWith(`${prefix}:`) && !keep(key) ) await store.delete(key);

}
function persist ( cache: PortCache, prefix: string, id: string, entry: Cached ): void {

    const index = typed<string[]>(cache.store);
    const place = `${prefix}:index`;
    const limit = cache.limit ?? storeLimit;

    void lane(prefix, async () => {

        const known = await index.read(place);

        if ( !known ) await sweep(cache.store, prefix, ( key ) => key === place);

        await typed<Cached>(cache.store).write(id, entry);

        const ids = (known ?? []).filter(( held ) => held !== id);

        ids.push(id);

        for ( const gone of ids.splice(0, Math.max(0, ids.length - limit)) ) await cache.store.delete(gone);

        await index.write(place, ids);

    }).catch(() => undefined);

}
export function forgetPorts ( cache: PortCache ): Promise<void> {

    const prefix = cache.prefix ?? "port";

    for ( const id of memory.keys() ) if ( id.startsWith(`${prefix}:`) ) memory.delete(id);

    return lane(prefix, () => sweep(cache.store, prefix, () => false)).catch(() => undefined);

}
export function portMemory ( cache: PortCache | undefined, key: string ): PortMemory {

    const prefix = cache?.prefix ?? "port";
    const id = `${prefix}:${key}`;
    const ttl = cache?.ttl ?? 0;
    const fresh = ( entry: Cached | undefined ): unknown => (entry && ttl > 0 && Date.now() - entry.at <= ttl ? entry.value : undefined);

    return {
        seed: () => {

            if ( !cache ) return undefined;

            const known = memory.get(id);

            if ( known ) return fresh(known);

            return typed<Cached>(cache.store).read(id).then(( entry ) => {

                if ( entry && !memory.has(id) ) memory.set(id, entry);

                return fresh(memory.get(id));

            });

        },
        keep: ( value ) => {

            if ( !cache ) return;

            const entry = { at: Date.now(), value };

            memory.set(id, entry);
            persist(cache, prefix, id, entry);

        },
    };

}
