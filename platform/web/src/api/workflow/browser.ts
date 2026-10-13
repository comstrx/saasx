"use client";

import { type ApiClient, createApi, requestContext } from "@engine/api";
import { choose, uuid } from "@engine/base";
import { observeCall } from "../../lib/observe/browser.ts";
import { browser } from "../../lib/spec/browser.ts";
import { routing } from "../../lib/spec/config.ts";
import { type Endpoints, endpoints } from "../features/index.ts";

type Session = () => string | null;

export function browserApi ( locale: string, session: Session ): ApiClient<Endpoints> {

    const language = choose(routing.locales, locale, routing.defaultLocale);

    return createApi(endpoints, browser.api, browser.contract, () => requestContext(browser.api.context, {
        language,
        host: window.location.host,
        auth: session() ?? undefined,
        requestId: uuid(),
    }), { execution: "client", observe: observeCall });

}
