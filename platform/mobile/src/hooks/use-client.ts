import { defineClient } from "engine/client";
import { createElement, type ReactNode } from "react";
import { endpoints } from "@/api/features";
import { useLocale } from "@/hooks/use-locale";
import { observeCall, trace } from "@/lib/observe/client";
import { secure } from "@/lib/providers/secure";
import { store } from "@/lib/providers/storage";
import { routing } from "@/lib/spec/config";
import { client as compiled, config, identity } from "@/lib/spec/runtime";
import { PreferencesProvider } from "@/stores/preferences";

export const client = defineClient({
    identity,
    endpoints,
    api: { api: compiled?.api ?? null, contract: compiled?.contract ?? config.contract },
    locales: routing.locales,
    useLocale,
    stores: { session: secure, persistent: store },
    answers: 24 * 60 * 60 * 1000,
    site: () => config.content,
    trace,
    realtime: config.realtime,
    observe: observeCall,
});

export const { useSession, useApi, useAccess, useGate, usePermission, usePort, useWrite, useReplay } = client;
export const { useSignal, useSignals, Provider: SignalsProvider } = client.signals;

export function SessionProvider ({ children }: { children: ReactNode }) {

    return createElement(PreferencesProvider, null, createElement(client.session.Provider, null, children));

}
