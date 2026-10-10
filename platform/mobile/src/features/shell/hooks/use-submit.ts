import { useCallback, useEffect, useRef, useState } from "react";
import { type Failure, failureBody, failureText, isFailure, reasonCopy } from "@/model/failure";
import { key } from "@/std/key";
import { notify } from "@/store/notice";

export type Fields = Record<string, string>;

type Aliases = Record<string, string>;

type Result<T> =
    | { ok: true; value: T }
    | { ok: false; fields: Fields };

type Submit = {
    busy: boolean;
    fields: Fields;
    reset: () => void;
    run: <T>( scope: string, task: ( attempt: string ) => Promise<T> ) => Promise<Result<T>>;
};

export const inlineFields = ( error: Failure, owned: readonly string[], alias: Aliases = {} ): Fields => {

    const entries = Object.entries(error.fields ?? {})
        .map(([ name, messages ]) => [ alias[name] ?? name, reasonCopy(error) ?? messages[0] ?? "" ] as const)
        .filter(([ name, message ]) => message.length > 0 && owned.includes(name) );

    return Object.fromEntries(entries);

};

const none: Aliases = {};

export function useSubmit ( owned: readonly string[] = [], alias: Aliases = none, lifetime: "global" | "form" = "global" ): Submit {

    const [ busy, setBusy ] = useState(false);
    const [ fields, setFields ] = useState<Fields>({});
    const alive = useRef(true);
    const revision = useRef(0);
    const pending = useRef(false);
    const scopes = useRef(new Set<string>());
    const [ owner ] = useState(() => lifetime === "form" ? key.attempt("form") : null);

    const invalidate = useCallback(() => {

        revision.current += 1;
        pending.current = false;
        for ( const scope of scopes.current ) key.release(scope);
        scopes.current.clear();

    }, []);

    const reset = useCallback(() => {

        invalidate();
        setBusy(false);
        setFields({});

    }, [ invalidate ]);

    useEffect(() => {

        alive.current = true;

        return () => { alive.current = false; invalidate(); };

    }, [ invalidate ]);

    const run = useCallback(async <T>( scope: string, task: ( attempt: string ) => Promise<T> ): Promise<Result<T>> => {

        if ( pending.current || !alive.current ) return { ok: false, fields: {} };

        pending.current = true;
        const version = revision.current;
        const current = () => alive.current && version === revision.current;
        const named = owner ? `${ owner }:${ version }:${ scope }` : scope;
        if ( owner ) scopes.current.add(named);
        setBusy(true);
        setFields({});

        try {

            const value = await task(key.hold(named));

            key.release(named);

            return current() ? { ok: true, value } : { ok: false, fields: {} };

        }
        catch ( failure ) {

            if ( !current() ) return { ok: false, fields: {} };

            if ( !isFailure(failure) ) { key.release(named); notify(failureText(failure)); return { ok: false, fields: {} }; }

            if ( failure.answered ) key.release(named);

            const owning = inlineFields(failure, owned, alias);

            if ( alive.current ) setFields(owning);

            if ( Object.keys(owning).length === 0 ) notify(failureBody(failure));

            return { ok: false, fields: owning };

        }
        finally {

            if ( current() ) { pending.current = false; setBusy(false); }

        }

    }, [ owned, alias, owner ]);

    return { busy, fields, run, reset };

}
