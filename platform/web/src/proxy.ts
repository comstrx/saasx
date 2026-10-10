import { type NextRequest, NextResponse } from "next/server";
import { cookieOptions, detectPreferences, preferenceCookies, readPreferences } from "@/lib/site/preferences";
import { connectOrigins, frameOrigins, imageOrigins, routing } from "@/lib/spec/config";
import { preferredPath, prefixed, splitLocale } from "@/lib/std/locale";
import { contentSecurityPolicy, nonce as token, trace } from "@/lib/std/security";

const development = process.env.NODE_ENV === "development";
const policy = contentSecurityPolicy({
    "default-src": ["'self'"],
    "script-src": ["'self'", "'nonce-{nonce}'", "'strict-dynamic'", development && "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "style-src-elem": ["'self'", development ? "'unsafe-inline'" : "'nonce-{nonce}'"],
    "style-src-attr": ["'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...imageOrigins],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...connectOrigins, development && "ws:", development && "wss:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-src": frameOrigins.length ? frameOrigins : ["'none'"],
    "frame-ancestors": ["'none'"],
});

function redirect ( request: NextRequest, path: string ): NextResponse {

    const url = request.nextUrl.clone();

    url.pathname = path;

    return NextResponse.redirect(url, 307);

}
function remember ( response: NextResponse, cookies: [string, string][] ): NextResponse {

    for ( const [name, value] of cookies ) {

        response.cookies.set(name, value, cookieOptions);

    }

    return response;

}
export function proxy ( request: NextRequest ) {

    const saved = readPreferences(( name ) => request.cookies.get(name)?.value);
    const detected = detectPreferences(request.headers, saved);
    const cookies = preferenceCookies(detected);
    const located = splitLocale(request.nextUrl.pathname, routing);
    const navigation = request.method === "GET" || request.method === "HEAD";
    const preferred = navigation ? preferredPath(located, saved.language ?? detected.language, routing) : undefined;

    if ( preferred ) return remember(redirect(request, preferred), cookies);

    for ( const [name, value] of cookies ) {

        request.cookies.set(name, value);

    }

    const nonce = token();
    const id = trace(request.headers.get("x-request-id"));
    const csp = policy.replaceAll("{nonce}", nonce);
    const headers = new Headers(request.headers);
    const internal = request.nextUrl.clone();

    headers.set("x-nonce", nonce);
    headers.set("x-locale", located.locale);
    headers.set("x-request-id", id);
    headers.set("Content-Security-Policy", csp);
    internal.pathname = prefixed(located.locale, located.path);

    const response = NextResponse.rewrite(internal, { request: { headers } });

    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("x-request-id", id);

    return remember(response, cookies);

}
export const config = {
    matcher: ["/((?!api/|_next/|assets/|_generated/|\\.well-known/|robots.txt|sitemap/|favicon.ico).*)"],
};
