"use client";

import { useEffect, useRef } from "react";
import type { LiveTopic } from "@/api/core/config";
import { coalesce } from "@/lib/std/timing";
import { useUi } from "@/stores/provider";
import { useApi } from "./use-api";

type Watch = {
    api: ReturnType<typeof useApi>;
    topic: LiveTopic;
    userId: number;
    entityId?: number;
    refresh: ReturnType<typeof coalesce>;
    close: () => void;
};

function watch ( state: Watch ): void {

    state.close();

    if ( document.visibilityState === "hidden" ) return;

    state.close = state.api.realtime.subscribe(state.topic, {
        userId: state.userId,
        entityId: state.entityId,
        onEvent: state.refresh.trigger,
        onStatus: ( connected ) => { if ( connected ) state.refresh.trigger(); },
    });

}
export function useRealtime ( topic: LiveTopic, onEvent: () => void, entityId?: number, enabled = true ): void {

    const api = useApi();
    const userId = useUi(( state ) => state.user?.id);
    const token = useUi(( state ) => state.token);
    const latest = useRef(onEvent);

    useEffect(() => { latest.current = onEvent; }, [onEvent]);

    useEffect(() => {

        if ( !enabled || !token || !userId ) return;

        const state: Watch = { api, topic, userId, entityId, refresh: coalesce(() => latest.current(), 150), close: () => {} };
        const listener = () => watch(state);

        listener();

        document.addEventListener("visibilitychange", listener);
        window.addEventListener("online", listener);

        return () => {

            state.close();
            state.refresh.cancel();
            document.removeEventListener("visibilitychange", listener);
            window.removeEventListener("online", listener);

        };

    }, [api, token, userId, entityId, topic, enabled]);

}
