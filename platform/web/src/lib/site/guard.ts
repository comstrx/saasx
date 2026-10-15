import "server-only";

import { rateLimiter } from "engine/cache";
import { forwardedFor, sameOrigin } from "engine/net";
import { config } from "@/lib/spec/server";

const proxies = config.api?.context.proxies ?? 0;
const limiter = rateLimiter({ limit: 60, windowMs: 60_000 });
const refused = { "cache-control": "no-store" };

export function guardRequest ( request: Request ): Response | null {

    const host = request.headers.get("x-forwarded-host") && proxies > 0 ? request.headers.get("x-forwarded-host") : request.headers.get("host");
    const secure = (proxies > 0 && request.headers.get("x-forwarded-proto") === "https") || new URL(request.url).protocol === "https:";

    if ( !sameOrigin(request.headers.get("origin"), host ?? "", secure) ) return Response.json({ status: false, message: "Cross-origin request refused." }, { status: 403, headers: refused });

    const client = forwardedFor(request.headers.get("x-forwarded-for"), proxies) ?? "local";
    const taken = limiter.take(client);

    if ( !taken.allowed ) return Response.json({ status: false, message: "Too many requests." }, { status: 429, headers: { ...refused, "retry-after": String(Math.ceil((taken.retryAfterMs ?? 1000) / 1000)) } });

    return null;

}
