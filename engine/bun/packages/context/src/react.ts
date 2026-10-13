import {
    type Context,
    createContext,
    createElement,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useStore } from "zustand";
import type { Defined, Instance, State } from "./store.ts";

export type Binding<S extends object, A extends object> = {
    Provider: (props: { children: ReactNode }) => ReactNode;
    useInstance: () => Instance<S, A>;
    use: <T>(selector: (state: State<S, A>) => T) => T;
};

/**
 * React bindings for a defined store: a provider that owns one instance and hydrates it once,
 * a hook for the instance and a selector hook.
 */
export function bind<S extends object, A extends object>(defined: Defined<S, A>): Binding<S, A> {
    const StoreContext: Context<Instance<S, A> | null> = createContext<Instance<S, A> | null>(null);
    const useInstance = (): Instance<S, A> => {
        const instance = useContext(StoreContext);

        if (!instance) throw new Error(`${defined.name}: use it inside its Provider.`);

        return instance;
    };

    return {
        Provider: ({ children }) => {
            const [instance] = useState(defined.create);

            useEffect(() => {
                void instance.hydrate();
            }, [instance]);

            return createElement(StoreContext.Provider, { value: instance }, children);
        },
        useInstance,
        use: (selector) => useStore(useInstance(), selector),
    };
}

export type Resource<T, M = undefined> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ready"; value: T; stale?: boolean | undefined; error?: unknown; meta?: M | undefined }
    | { status: "failed"; error: unknown };

type Seed<T> = () => T | undefined | Promise<T | undefined>;

const isPromise = (value: unknown): value is Promise<unknown> =>
    typeof (value as { then?: unknown } | undefined)?.then === "function";

/**
 * An async value keyed by its inputs: reloads when the key changes, ignores answers that arrive
 * after a newer key, and starts ready when `local` already knows the value. A seed serves a stale
 * value while the load runs, at once when it is known, as soon as it resolves otherwise; when the
 * load then fails the stale value stays, with the error beside it.
 */
export function useResource<T>(
    key: string,
    load: (signal: AbortSignal) => Promise<T>,
    local?: () => { local: true; value: T } | { local: false },
    seed?: Seed<T>,
): Resource<T> {
    const initial = (): Resource<T> => {
        const known = local?.();

        if (known?.local) return { status: "ready", value: known.value };

        const stale = seed?.();

        return stale === undefined || isPromise(stale)
            ? { status: "loading" }
            : { status: "ready", value: stale, stale: true };
    };
    const [state, setState] = useState<Resource<T>>(initial);

    useEffect(() => {
        const known = local?.();

        if (known?.local) {
            setState({ status: "ready", value: known.value });

            return undefined;
        }

        let live = true;
        let settled = false;
        let stale: T | undefined;
        const controller = new AbortController();
        const seeded = seed?.();

        if (isPromise(seeded)) {
            setState({ status: "loading" });
            void seeded.then((value) => {
                stale = value;
                if (live && !settled && value !== undefined) setState({ status: "ready", value, stale: true });
            });
        } else {
            stale = seeded;
            setState(seeded === undefined ? { status: "loading" } : { status: "ready", value: seeded, stale: true });
        }

        load(controller.signal)
            .then((value) => {
                settled = true;
                if (live) setState({ status: "ready", value });
            })
            .catch((error: unknown) => {
                settled = true;
                if (!live) return;

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

export type Action<T> =
    | { status: "idle"; error?: undefined; result?: undefined }
    | { status: "pending"; error?: undefined; result?: undefined }
    | { status: "done"; result: T; error?: undefined }
    | { status: "failed"; error: unknown; result?: undefined };
export type Runner<I, T, O = undefined> = Action<T> & {
    run: (input: I, options?: O) => Promise<T | undefined>;
    reset: () => void;
};

/**
 * A user-triggered async action: one run at a time, the latest answer wins, failures are kept for
 * the form to show, and `run` resolves to the result or undefined when it failed.
 */
export function useAction<I, T, O = undefined>(perform: (input: I, options?: O) => Promise<T>): Runner<I, T, O> {
    const [state, setState] = useState<Action<T>>({ status: "idle" });
    const sequence = useRef(0);
    const run = useCallback(
        async (input: I, options?: O): Promise<T | undefined> => {
            sequence.current += 1;

            const mine = sequence.current;

            setState({ status: "pending" });

            try {
                const result = await perform(input, options);

                if (mine === sequence.current) setState({ status: "done", result });

                return result;
            } catch (error) {
                if (mine === sequence.current) setState({ status: "failed", error });

                return undefined;
            }
        },
        [perform],
    );
    const reset = useCallback(() => {
        sequence.current += 1;
        setState({ status: "idle" });
    }, []);

    return { ...state, run, reset };
}
