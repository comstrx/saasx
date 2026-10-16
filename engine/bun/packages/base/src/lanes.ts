export type Lanes = <T>( key: string, work: () => Promise<T> ) => Promise<T>;

export function lanes (): Lanes {

    const tails = new Map<string, Promise<unknown>>();

    return ( key, work ) => {

        const run = (tails.get(key) ?? Promise.resolve()).then(work, work);
        const tail = run.catch(() => undefined);

        tails.set(key, tail);
        void tail.then(() => {

            if ( tails.get(key) === tail ) tails.delete(key);

        });

        return run;

    };

}
