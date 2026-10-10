"use client";

import { useMemo } from "react";
import type { Socket } from "@/api/core/realtime";
import { browserApi } from "@/api/workflow/browser";
import { useLocale } from "@/lib/providers/intl";
import { useSite } from "@/lib/site/context";
import { limitsOf } from "@/lib/std/form";
import { useUi } from "@/stores/provider";

type SocketPolicy = Pick<ReturnType<typeof useSite>["policy"], "socket_scheme" | "socket_host" | "socket_port" | "socket_key">;

function socketOf ( { socket_scheme: scheme, socket_host: host, socket_port: port, socket_key: key }: SocketPolicy ): Socket | undefined {

    return scheme && host && port && key ? { scheme, host, port, key } : undefined;

}
export function useApi ( session: { currency?: string; auth?: string } = {} ) {

    const language = useLocale();
    const { policy } = useSite();
    const { upload_max_bytes: file, request_max_bytes: request, upload_max_count: count } = policy;
    const selectedCurrency = useUi(( state ) => state.currency);
    const selectedToken = useUi(( state ) => state.token);
    const currency = session.currency ?? selectedCurrency;
    const auth = session.auth ?? selectedToken ?? undefined;
    const limits = useMemo(() => limitsOf(file, request, count), [file, request, count]);
    const { socket_scheme, socket_host, socket_port, socket_key } = policy;
    const socket = useMemo(() => socketOf({ socket_scheme, socket_host, socket_port, socket_key }), [
        socket_scheme, socket_host, socket_port, socket_key,
    ]);

    return useMemo(() => browserApi({ currency, auth, language }, limits, socket), [currency, auth, language, limits, socket]);

}
