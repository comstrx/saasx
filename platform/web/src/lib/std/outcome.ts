export type Outcome<T> = { ok: true; value: T } | { ok: false; error: unknown };

export function outcome<T> ( promise: Promise<T> ): Promise<Outcome<T>> {

    return promise.then(( value ) => ({ ok: true as const, value }), ( error: unknown ) => ({ ok: false as const, error }));

}
