import { resolve } from "node:path";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER } from "next/constants.js";
import createNextIntlPlugin from "next-intl/plugin";
import { compileSpec } from "./tools/compile/index.ts";

const root = import.meta.dirname;

const excluded = [
    "./specs/**/*",
    "./src/**/*",
    "./tools/**/*",
    "./messages/**/*",
    "./.next/cache/**/*",
    "./node_modules/.cache/**/*",
    "./.env*",
];
const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

export default async function nextConfig ( phase: string ) {

    if ( phase === PHASE_PRODUCTION_SERVER ) {

        throw new Error("Use pnpm start or the standalone server.js; the source public directory is not a release.");

    }

    const development = phase === PHASE_DEVELOPMENT_SERVER;
    const spec = await compileSpec(development ? "development" : "production");
    const devOrigins = (process.env.NEXT_DEV_ORIGINS ?? "").split(/[\s,]+/).filter(Boolean);

    const config: NextConfig = {
        output: "standalone",
        productionBrowserSourceMaps: false,
        reactCompiler: true,
        typedRoutes: true,
        poweredByHeader: false,
        agentRules: false,
        images: { unoptimized: true },
        experimental: { optimizePackageImports: ["@phosphor-icons/react", "@phosphor-icons/react/ssr", "@base-ui/react"] },
        ...(development && devOrigins.length ? { allowedDevOrigins: devOrigins } : {}),
        env: { NEXT_PUBLIC_SPEC: spec.identity },
        outputFileTracingExcludes: { "/*": excluded },
        turbopack: { root, resolveAlias: spec.aliases },
        webpack: ( configuration ) => {

            configuration.resolve.alias = {
                ...configuration.resolve.alias,
                ...Object.fromEntries(Object.entries(spec.aliases).map(( [key, path] ) => [key, resolve(root, path)])),
            };
            return configuration;

        },
        rewrites: async () => ({
            beforeFiles: development ? spec.paths.map(( path ) => ({
                source: `/${path}/:path*`,
                destination: `${spec.assetRoot}/${path}/:path*`,
            })) : [],
            afterFiles: [],
            fallback: [],
        }),
        headers: async () => [{ source: "/(.*)", headers }],
    };

    return createNextIntlPlugin("./src/app/intl.ts")(config);

}
