"use client";

import { type ApiClient, createApi, requestContext } from "@engine/api";
import { choose } from "@engine/base";
import { observeCall, trace } from "../../lib/observe/browser.ts";
import { browser } from "../../lib/spec/browser.ts";
import { routing } from "../../lib/spec/config.ts";
import { type Endpoints, endpoints } from "../features/index.ts";

type Session = () => string | null;
type Denied = () => void;

export function browserApi ( locale: string, session: Session, denied?: Denied ): ApiClient<Endpoints> {

    const language = choose(routing.locales, locale, routing.defaultLocale);

    return createApi(endpoints, browser.api, browser.contract, () => requestContext(browser.api.context, {
        language,
        host: window.location.host,
        auth: session() ?? undefined,
        requestId: trace,
    }), { execution: "client", observe: observeCall, onFailure: ( failure ) => { if ( failure.status === 401 && session() ) denied?.(); } });

}
