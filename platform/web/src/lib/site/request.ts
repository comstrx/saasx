import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { config } from "@/lib/spec/server";
import { trace } from "@/lib/std/security";
import { forwardedFor, originOf } from "@/lib/std/url";

const { proxies } = config.api.context;

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
export const requestTrace = cache(async () => trace((await headers()).get("x-request-id")));
export const requestClient = cache(async () => forwardedFor((await headers()).get("x-forwarded-for"), proxies));
