import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve, sep } from "node:path";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

type Meta = { identity: string; delivery: "server" | "static"; secure: boolean; insecure: boolean; media: string[]; aliases: Record<string, string> };

const root = import.meta.dirname;
const engine = dirname(realpathSync(createRequire(import.meta.url).resolve("engine/package.json")));
const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];
const transport = { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" };
const lasting = [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }];

function shared ( a: string, b: string ): string {
    const left = a.split(sep);
    const right = b.split(sep);
    const length = left.findIndex(( part, index ) => part !== right[index]);

    return left.slice(0, length === -1 ? left.length : length).join(sep) || sep;
}
function compiled ( mode: "development" | "production" ): Meta {
    const path = resolve(root, "node_modules/.cache/spec", mode, "meta.json");

    if ( !existsSync(path) ) throw new Error(`No compiled spec for ${mode}: run \`bun tools/compile/index.ts ${mode}\` first.`);

    return JSON.parse(readFileSync(path, "utf8")) as Meta;
}
export default function nextConfig ( phase: string ): NextConfig {
    const development = phase === PHASE_DEVELOPMENT_SERVER;
    const spec = compiled(development ? "development" : "production");
    const workspace = shared(root, engine);
    const devOrigins = (process.env.NEXT_DEV_ORIGINS ?? "").split(/[\s,]+/).filter(Boolean);

    return {
        output: spec.delivery === "static" ? "export" : "standalone",
        productionBrowserSourceMaps: false,
        reactCompiler: true,
        experimental: { staleTimes: { dynamic: 30, static: 180 } },
        typedRoutes: true,
        poweredByHeader: false,
        agentRules: false,
        images: {
            unoptimized: spec.delivery === "static",
            formats: ["image/avif", "image/webp"],
            deviceSizes: [640, 828, 1080, 1440, 1920],
            imageSizes: [96, 192, 256, 384],
            remotePatterns: spec.media.map(( origin ) => new URL(`${origin}/**`)),
            dangerouslyAllowLocalIP: spec.insecure,
            minimumCacheTTL: 2592000,
        },
        env: { NEXT_PUBLIC_SPEC: spec.identity },
        transpilePackages: ["engine"],
        outputFileTracingRoot: workspace,
        turbopack: { root: workspace, resolveAlias: spec.aliases },
        ...(development && devOrigins.length ? { allowedDevOrigins: devOrigins } : {}),
        headers: async () => [
            { source: "/(.*)", headers: spec.secure ? [...headers, transport] : headers },
            { source: "/_generated/world/:path*", headers: lasting },
        ],
    };
}
