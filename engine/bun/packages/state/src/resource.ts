import { useEffect, useState } from "react";

export type Resource<T, M = undefined> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ready"; value: T; stale?: boolean | undefined; error?: unknown; meta?: M | undefined }
    | { status: "failed"; error: unknown };

type Seed<T> = () => T | undefined | Promise<T | undefined>;

const isPromise = ( value: unknown ): value is Promise<unknown> =>
    typeof (value as { then?: unknown } | undefined)?.then === "function";

export function useResource<T> (
    key: string,
    load: ( signal: AbortSignal ) => Promise<T>,
    local?: () => { local: true; value: T } | { local: false },
    seed?: Seed<T>,
): Resource<T> {

    const initial = (): Resource<T> => {

        const known = local?.();

        if ( known?.local ) return { status: "ready", value: known.value };

        const stale = seed?.();

        return stale === undefined || isPromise(stale)
            ? { status: "loading" }
            : { status: "ready", value: stale, stale: true };

    };
    const [state, setState] = useState<Resource<T>>(initial);

    useEffect(() => {

        const known = local?.();

        if ( known?.local ) {

            setState({ status: "ready", value: known.value });

            return undefined;

        }

        let live = true;
        let settled = false;
        let stale: T | undefined;
        const controller = new AbortController();
        const seeded = seed?.();

        if ( isPromise(seeded) ) {

            setState({ status: "loading" });
            void seeded.then(( value ) => {

                stale = value;

                if ( live && !settled && value !== undefined ) setState({ status: "ready", value, stale: true });

            });

        } else {

            stale = seeded;
            setState(seeded === undefined ? { status: "loading" } : { status: "ready", value: seeded, stale: true });

        }

        load(controller.signal)
            .then(( value ) => {

                settled = true;

                if ( live ) setState({ status: "ready", value });

            })
            .catch(( error: unknown ) => {

                settled = true;

                if ( !live ) return;

                setState(
                    stale === undefined
                        ? { status: "failed", error }
                        : { status: "ready", value: stale, stale: true, error },
                );

            });

        return () => {

            live = false;
            controller.abort();

        };

    }, [key]);

    return state;

}
