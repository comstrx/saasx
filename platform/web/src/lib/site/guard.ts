import "server-only";

import { rateLimiter } from "engine/cache";
import { forwarded, forwardedFor, sameOrigin } from "engine/net";
import { proxies } from "@/lib/site/request";

const limiter = rateLimiter({ limit: 60, windowMs: 60_000 });
const refused = { "cache-control": "no-store" };

export function guardRequest ( request: Request ): Response | null {

    const host = forwarded(request.headers, "x-forwarded-host", proxies) ?? request.headers.get("host");
    const secure = forwarded(request.headers, "x-forwarded-proto", proxies) === "https" || new URL(request.url).protocol === "https:";

    if ( !sameOrigin(request.headers.get("origin"), host ?? "", secure) ) {

        return Response.json({ status: false, message: "Cross-origin request refused." }, { status: 403, headers: refused });

    }

    const client = forwardedFor(request.headers.get("x-forwarded-for"), proxies) ?? "local";
    const taken = limiter.take(client);

    if ( !taken.allowed ) {

        const wait = String(Math.ceil((taken.retryAfterMs ?? 1000) / 1000));

        const headers = { ...refused, "retry-after": wait };

        return Response.json({ status: false, message: "Too many requests." }, { status: 429, headers });

    }

    return null;

}
