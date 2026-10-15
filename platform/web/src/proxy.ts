import { trace } from "engine/base";
import { contentSecurityPolicy, nonce as token } from "engine/net";
import { preferredPath, prefixed, splitLocale } from "engine/translate";
import { type NextRequest, NextResponse } from "next/server";
import { cookieOptions, detectPreferences, preferenceCookies, readPreferences } from "@/lib/site/preferences";
import { routing } from "@/lib/spec/config";
import { config as site } from "@/lib/spec/server";

const development = process.env.NODE_ENV === "development";
const backends = Object.values(site.api?.connections ?? {}).flatMap(( connection ) => (connection.baseUrl ? [new URL(connection.baseUrl).origin] : []));
const media = site.settings.mediaOrigins;
const sockets = site.realtime ? [new URL(site.realtime.url).origin] : [];
const policy = contentSecurityPolicy({
    "default-src": ["'self'"],
    "script-src": ["'self'", "'nonce-{nonce}'", "'strict-dynamic'", development && "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...backends, ...media],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...backends, ...sockets, development && "ws:", development && "wss:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
});

function redirect ( request: NextRequest, path: string ): NextResponse {

    const url = request.nextUrl.clone();

    url.pathname = path;

    return NextResponse.redirect(url, 307);

}
function canonical ( request: NextRequest, path: string ): NextResponse {

    const url = request.nextUrl.clone();

    url.pathname = path;

    return NextResponse.redirect(url, 308);

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

    if ( navigation && located.explicit && located.locale === routing.defaultLocale ) return canonical(request, located.path);
    if ( preferred ) return remember(redirect(request, preferred), cookies);

    const nonce = token();
    const id = trace(request.headers.get("x-request-id"));
    const csp = policy.replaceAll("{nonce}", nonce);
    const headers = new Headers(request.headers);
    const internal = request.nextUrl.clone();

    headers.set("x-nonce", nonce);
    headers.set("x-locale", located.locale);
    headers.set("x-request-id", id);

    internal.pathname = prefixed(located.locale, located.path);

    const response = NextResponse.rewrite(internal, { request: { headers } });

    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("x-request-id", id);

    return remember(response, cookies);

}
export const config = {
    matcher: ["/((?!api/|_next/|images/|fonts/|videos/|audios/|_generated/|\\.well-known/|robots.txt|sitemap.xml|favicon.ico).*)"],
};
