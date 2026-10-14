"use client";

import { defineClient } from "@engine/context";
import { endpoints } from "@/api/features";
import { useLocale } from "@/hooks/use-locale";
import { observeCall, trace } from "@/lib/observe/browser";
import { persistent, session } from "@/lib/providers/storage";
import { browser } from "@/lib/spec/browser";
import { identity, routing } from "@/lib/spec/config";

export const client = defineClient({
    identity,
    endpoints,
    api: browser,
    locales: routing.locales,
    useLocale,
    stores: { session, persistent },
    answers: 10 * 60 * 1000,
    site: () => browser.contract.values.content,
    trace,
    realtime: browser.realtime,
    host: () => window.location.host,
    observe: observeCall,
});

export const { outbox, useSession, useApi, useAccess, usePermission, usePort, useWrite } = client;
export const { useSignal, useSignals, Provider: SignalsProvider } = client.signals;
export const SessionProvider = client.session.Provider;
