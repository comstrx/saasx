import { useCallback, useEffect, useState } from "react";

type Countdown = {
    left: number;
    reset: ( next?: number ) => void;
};

export function useCountdown ( seconds: number ): Countdown {

    const [ until, setUntil ] = useState(() => Date.now() + seconds * 1000 );
    const [ left, setLeft ] = useState(seconds);

    useEffect(() => {

        const read = () => Math.max(0, Math.ceil(( until - Date.now() ) / 1000));

        setLeft(read());

        const tick = setInterval(() => {

            const rest = read();

            setLeft(rest);

            if ( rest === 0 ) clearInterval(tick);

        }, 500);

        return () => clearInterval(tick);

    }, [ until ]);

    const reset = useCallback(( next?: number ) => setUntil(Date.now() + ( next ?? seconds ) * 1000), [ seconds ]);

    return { left, reset };

}
