import "server-only";

import { choose, trace } from "engine/base";
import { forwardedFor, originOf } from "engine/net";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { readPreferences } from "@/lib/site/preferences";
import { config, routing } from "@/lib/spec/server";

const proxies = config.api?.context.proxies ?? 0;

function forwarded ( request: Headers, name: string ): string | undefined {

    return (proxies > 0 && request.get(name)?.split(",")[0]?.trim()) || undefined;

}
export const requestHost = cache(async () => {

    const request = await headers();

    return forwarded(request, "x-forwarded-host") || request.get("host") || undefined;

});
export const requestOrigin = cache(async () => {

    if ( config.content.url ) return config.content.url;

    const request = await headers();
    const host = await requestHost();
    const secure = forwarded(request, "x-forwarded-proto") === "https" || process.env.NODE_ENV === "production";
    const origin = host ? originOf(host, secure) : undefined;

    if ( !origin ) throw new Error("The request carries no usable host.");

    return origin;

});
export const requestLocale = cache(async () => choose(routing.locales, (await headers()).get("x-locale"), routing.defaultLocale));
export const requestTrace = cache(async () => trace((await headers()).get("x-request-id")));
export const requestClient = cache(async () => forwardedFor((await headers()).get("x-forwarded-for"), proxies));
export const requestNonce = cache(async () => (await headers()).get("x-nonce") ?? "");
export const requestTheme = cache(async () => {

    const store = await cookies();

    return readPreferences(( name ) => store.get(name)?.value).theme ?? config.settings.theme.default;

});
