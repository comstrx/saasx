type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

export function touched ( features: readonly string[] ): void {

    for ( const feature of features ) for ( const listener of listeners.get(feature) ?? [] ) listener();

}
export function onTouched ( feature: string, listener: Listener ): () => void {

    const set = listeners.get(feature) ?? new Set<Listener>();

    set.add(listener);
    listeners.set(feature, set);

    return () => {

        set.delete(listener);

        if ( !set.size ) listeners.delete(feature);

    };

}
