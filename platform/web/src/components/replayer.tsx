"use client";

import type { ApiSurface } from "@engine/api";
import { touched } from "@engine/context";
import { useEffect } from "react";
import { outbox, useApi } from "@/hooks/use-client";
import { useDevice } from "@/hooks/use-device";

export default function Replayer () {

    const api = useApi() as ApiSurface;
    const device = useDevice();

    useEffect(() => {

        const replay = async (): Promise<void> => {

            const outcome = await outbox.replay(async ( entry ) => {

                await api[entry.feature]?.[entry.operation]?.(entry.input, { idempotencyKey: entry.idempotencyKey });
                touched([entry.feature]);

            });

            if ( outcome.sent ) touched([]);

        };

        if ( device.info().online ) void replay();

        return device.watch("online", ( online ) => { if ( online ) void replay(); });

    }, [api, device]);

    return null;

}
