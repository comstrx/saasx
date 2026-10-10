"use client";

import { observeCall } from "../../lib/observe/browser.ts";
import { browser } from "../../lib/spec/browser.ts";
import { supportedLocales } from "../../lib/spec/languages.ts";
import type { UploadLimits } from "../../lib/std/form.ts";
import { includes } from "../../lib/std/object.ts";
import { createSurface, typed } from "../core/client.ts";
import type { LiveTopic } from "../core/config.ts";
import { ApiError } from "../core/error.ts";
import { type Socket, subscribe } from "../core/realtime.ts";
import { requestContext } from "../core/request.ts";

export type Values = { language: string; currency?: string; auth?: string };
export type Watch = Parameters<typeof subscribe>[5];

function context ( values: Values ) {

    if ( typeof window === "undefined" ) throw new ApiError("execution");
    if ( !includes(supportedLocales, values.language) ) throw new ApiError("input");

    return requestContext(browser.api.context, { ...values, host: window.location.host, requestId: document.documentElement.dataset.trace });

}
export function remoteApi ( values: Values, limits?: UploadLimits, socket?: Socket ) {

    const surface = createSurface(browser.api, browser.contract, () => context(values), { execution: "client", limits, observe: observeCall });

    return {
        surface,
        subscribe: ( topic: LiveTopic, options: Watch ) => subscribe(browser.api.realtime, socket, typed(surface), values.auth, topic, options),
    };

}
