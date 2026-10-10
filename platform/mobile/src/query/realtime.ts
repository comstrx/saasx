import { useEffect, useRef, useSyncExternalStore } from "react";
import { type ChannelKind, connect, onAlert, ready, watch } from "@/api/realtime";
import { useSigned } from "@/query/wire";

const useRealtimeReady = (): boolean => useSyncExternalStore(watch, ready, () => false );

export function useRealtime<T = unknown> ( channel: string | null, event: string, handler: ( payload: T ) => void, kind: ChannelKind = "private" ) {

    const signed = useSigned();
    const live = useRealtimeReady();
    const latest = useRef(handler);

    useEffect(() => { latest.current = handler; }, [ handler ]);

    useEffect(() => {

        if ( !signed || !channel || !live ) return;

        const off = onAlert(channel, event, ( payload ) => latest.current(payload as T), kind);

        connect();

        return off;

    }, [ signed, channel, event, kind, live ]);

}
