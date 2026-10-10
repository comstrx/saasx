
type Window = { used: number; until: number };

export function keep<T> ( entries: Map<string, T>, key: string, value: T, capacity: number ): void {

    entries.delete(key);
    entries.set(key, value);

    if ( entries.size > capacity ) entries.delete(entries.keys().next().value ?? key);

}
export function expiring<T> ( lifetime: number, settled: ( error: unknown ) => boolean = () => false, capacity = 500 ) {

    const entries = new Map<string, { value: Promise<T>; until: number }>();

    return ( key: string, load: () => Promise<T> ): Promise<T> => {

        const now = Date.now();
        const hit = entries.get(key);

        if ( hit && hit.until > now ) return hit.value;

        const value = load();

        keep(entries, key, { value, until: now + lifetime }, capacity);
        value.catch(( error: unknown ) => { if ( !settled(error) && entries.get(key)?.value === value ) entries.delete(key); });

        return value;

    };

}
export function budget ( limit: number, span: number, capacity = 10000 ) {

    const windows = new Map<string, Window>();

    return ( key: string, cost = 1 ): boolean => {

        const now = Date.now();
        const found = windows.get(key);
        const current = found && found.until > now ? found : { used: 0, until: now + span };

        if ( current.used + cost > limit ) return false;

        current.used += cost;
        keep(windows, key, current, capacity);

        return true;

    };

}
