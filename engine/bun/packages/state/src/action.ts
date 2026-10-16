import { useCallback, useRef, useState } from "react";

export type Action<T> =
    | { status: "idle"; error?: undefined; result?: undefined }
    | { status: "pending"; error?: undefined; result?: undefined }
    | { status: "done"; result: T; error?: undefined }
    | { status: "failed"; error: unknown; result?: undefined };
export type Runner<I, T, O = undefined> = Action<T> & {
    run: ( input: I, options?: O ) => Promise<T | undefined>;
    reset: () => void;
};

export function useAction<I, T, O = undefined> ( perform: ( input: I, options?: O ) => Promise<T> ): Runner<I, T, O> {

    const [state, setState] = useState<Action<T>>({ status: "idle" });
    const sequence = useRef(0);
    const run = useCallback(
        async ( input: I, options?: O ): Promise<T | undefined> => {

            sequence.current += 1;

            const mine = sequence.current;

            setState({ status: "pending" });

            try {

                const result = await perform(input, options);

                if ( mine === sequence.current ) setState({ status: "done", result });

                return result;

            } catch ( error ) {

                if ( mine === sequence.current ) setState({ status: "failed", error });

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
