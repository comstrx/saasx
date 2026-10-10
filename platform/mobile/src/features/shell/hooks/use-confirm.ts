import { useCallback, useRef, useState } from "react";
import { type Fields, inlineFields } from "@/features/shell/hooks/use-submit";
import { type Challenge, challengeOf, type Failure, failureBody, failureText, isFailure } from "@/model/failure";
import { key } from "@/std/key";
import { notify } from "@/store/notice";

type Money<T> = ( attempt: string, code: string | null ) => Promise<T>;

type Confirm<T> = {
    busy: boolean;
    asking: boolean;
    wrong: string;
    challenge: Challenge | null;
    fields: Fields;
    run: ( scope: string, task: Money<T> ) => Promise<T | null>;
    answer: ( code: string ) => Promise<T | null>;
    resend: () => Promise<void>;
    dismiss: () => void;
};

type Fail = ( failure: Failure ) => boolean;

export function useConfirm<T> ( onDone?: ( value: T ) => void, owned: readonly string[] = [], onFail?: Fail ): Confirm<T> {

    const [ busy, setBusy ] = useState(false);
    const [ asking, setAsking ] = useState(false);
    const [ wrong, setWrong ] = useState("");
    const [ challenge, setChallenge ] = useState<Challenge | null>(null);
    const [ fields, setFields ] = useState<Fields>({});
    const pending = useRef<{ scope: string; task: Money<T> } | null>(null);

    const attempt = useCallback(async ( scope: string, task: Money<T>, code: string | null ): Promise<T | null> => {

        setBusy(true);
        setWrong("");
        setFields({});

        try {

            const value = await task(key.hold(scope), code);

            key.release(scope);
            pending.current = null;
            setAsking(false);
            onDone?.(value);

            return value;

        }
        catch ( failure ) {

            if ( !isFailure(failure) ) { key.release(scope); notify(failureText(failure)); return null; }

            if ( failure.answered ) key.release(scope);

            if ( onFail?.(failure) ) return null;

            if ( failure.confirmable ) {

                pending.current = { scope, task };
                setAsking(true);
                setChallenge(challengeOf(failure));
                setWrong(code ? failureBody(failure) : "");

                return null;

            }

            const owning = inlineFields(failure, owned);

            setFields(owning);

            if ( Object.keys(owning).length === 0 ) notify(failureBody(failure));

            return null;

        }
        finally {

            setBusy(false);

        }

    }, [ onDone, onFail, owned ]);

    const run = useCallback(( scope: string, task: Money<T> ) => attempt(scope, task, null), [ attempt ]);

    const answer = useCallback(( code: string ) => {

        const held = pending.current;

        return held ? attempt(held.scope, held.task, code) : Promise.resolve(null);

    }, [ attempt ]);

    const resend = useCallback(async () => {

        const held = pending.current;

        if ( held ) await attempt(held.scope, held.task, null);

    }, [ attempt ]);

    const dismiss = useCallback(() => {

        if ( pending.current ) key.release(pending.current.scope);

        pending.current = null;
        setAsking(false);
        setChallenge(null);
        setWrong("");
        setFields({});

    }, []);

    return { busy, asking, wrong, challenge, fields, run, answer, resend, dismiss };

}
