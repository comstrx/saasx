import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

type Meta = { identity: string; delivery: "server" | "static"; assetRoot: string; paths: string[]; aliases: Record<string, string> };

const root = import.meta.dirname;
const engine = Object.fromEntries(["base", "api", "spec"].map(( name ) => [`@engine/${name}`, `../../engine/bun/packages/${name}/src/index.ts`]));
const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

function compiled ( mode: "development" | "production" ): Meta {

    const path = resolve(root, "node_modules/.cache/spec", mode, "meta.json");

    if ( !existsSync(path) ) throw new Error(`No compiled spec for ${mode}: run \`bun tools/compile/index.ts ${mode}\` first.`);

    return JSON.parse(readFileSync(path, "utf8")) as Meta;

}
export default function nextConfig ( phase: string ): NextConfig {

    const development = phase === PHASE_DEVELOPMENT_SERVER;
    const spec = compiled(development ? "development" : "production");
    const devOrigins = (process.env.NEXT_DEV_ORIGINS ?? "").split(/[\s,]+/).filter(Boolean);

    return {
        output: spec.delivery === "static" ? "export" : "standalone",
        productionBrowserSourceMaps: false,
        reactCompiler: true,
        typedRoutes: true,
        poweredByHeader: false,
        agentRules: false,
        images: { unoptimized: true },
        env: { NEXT_PUBLIC_SPEC: spec.identity },
        outputFileTracingRoot: resolve(root, "../.."),
        turbopack: { root: resolve(root, "../.."), resolveAlias: { ...spec.aliases, ...engine } },
        ...(development && devOrigins.length ? { allowedDevOrigins: devOrigins } : {}),
        rewrites: async () => ({
            beforeFiles: development ? spec.paths.map(( path ) => ({ source: `/${path}/:path*`, destination: `${spec.assetRoot}/${path}/:path*` })) : [],
            afterFiles: [],
            fallback: [],
        }),
        headers: async () => [{ source: "/(.*)", headers }],
    };

}
