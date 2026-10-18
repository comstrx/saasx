import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { BunPlugin } from "bun";

type Meta = { identity: string; aliases: Record<string, string> };

export const root = resolve(import.meta.dir, "../..");

export function compiled ( mode: "development" | "production" ): Meta {

    const path = resolve(root, "node_modules/.cache/spec", mode, "meta.json");

    if ( !existsSync(path) ) throw new Error(`No compiled spec for ${mode}: run \`bun tools/compile/index.ts ${mode}\` first.`);

    return JSON.parse(readFileSync(path, "utf8")) as Meta;

}
export function aliasPlugin ( aliases: Record<string, string> ): BunPlugin {

    const names = Object.keys(aliases).map(( name ) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const filter = new RegExp(`^(?:${names})$`);
    const served = /^\/(?!\/)/;
    const shared = /^react(?:-dom)?(?:\/.*)?$/;

    return {
        name: "spec-aliases",
        setup ( build ) {

            build.onResolve({ filter }, ( args ) => ({ path: resolve(root, aliases[args.path] ?? args.path) }));
            build.onResolve({ filter: shared }, ( args ) => ({ path: Bun.resolveSync(args.path, root) }));
            build.onResolve({ filter: served }, ( args ) => (existsSync(resolve(root, "public", args.path.slice(1))) ? { path: args.path, external: true } : undefined));

        },
    };

}

const mode = process.env.NODE_ENV === "production" ? "production" : "development";

export default aliasPlugin(compiled(mode).aliases);
