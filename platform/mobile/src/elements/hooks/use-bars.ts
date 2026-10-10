import { useEffect, useState } from "react";
import { type SystemBarStyle, SystemBars } from "react-native-edge-to-edge";

export function useBars ( open: boolean, style: SystemBarStyle ): boolean {

    const [ ready, setReady ] = useState(false);

    useEffect(() => {

        if ( !open ) {

            setReady(false);

            return;

        }

        const entry = SystemBars.pushStackEntry({ style });
        const frame = requestAnimationFrame(() => setReady(true) );

        return () => {

            cancelAnimationFrame(frame);
            SystemBars.popStackEntry(entry);

        };

    }, [ open, style ]);

    return open && ready;

}
