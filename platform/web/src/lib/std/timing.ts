
export function coalesce ( run: () => void, delay: number ) {

    let timer: ReturnType<typeof setTimeout> | undefined;

    return {
        trigger (): void {

            if ( timer ) return;

            timer = setTimeout(() => {

                timer = undefined;
                run();

            }, delay);

        },
        cancel (): void {

            if ( timer ) clearTimeout(timer);

            timer = undefined;

        },
    };

}
export function delay ( ms: number, signal?: AbortSignal ): Promise<void> {

    return new Promise(( resolve, reject ) => {

        const abort = () => {

            clearTimeout(timer);
            reject(signal?.reason);

        };
        const timer = setTimeout(() => {

            signal?.removeEventListener("abort", abort);
            resolve();

        }, ms);

        if ( signal?.aborted ) abort();
        else signal?.addEventListener("abort", abort, { once: true });

    });

}
