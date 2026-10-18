import { cpSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { report, task } from "engine/tooling";
import { compileSpec } from "../compile/index.ts";
import { installedSpecs, specFromEnvironment } from "../core/index.ts";
import { aliasPlugin, root } from "./alias.ts";

export type Bundled = { identity: string; outdir: string; bytes: number; files: number };

const current = resolve(root, "dist", "current");

export async function bundleSpec ( identity: string ): Promise<Bundled> {

    process.env.DESK_SPEC = identity;

    const meta = await compileSpec("production");
    const outdir = resolve(root, "dist", identity);

    rmSync(outdir, { recursive: true, force: true });

    const built = await Bun.build({
        entrypoints: [resolve(root, "index.html")],
        outdir,
        target: "browser",
        minify: true,
        sourcemap: "none",
        naming: { entry: "[name].[ext]", chunk: "[name]-[hash].[ext]", asset: "[name]-[hash].[ext]" },
        loader: { ".woff2": "file", ".woff": "file", ".ttf": "file", ".otf": "file" },
        splitting: true,
        define: { "process.env.DESK_SPEC": JSON.stringify(identity), "process.env.NODE_ENV": JSON.stringify("production") },
        plugins: [aliasPlugin(meta.aliases)],
        throw: false,
    });

    if ( !built.success ) throw new Error(built.logs.map(( log ) => log.message).join("\n"));

    cpSync(resolve(root, "public"), outdir, { recursive: true, filter: ( source ) => !source.endsWith(".gitignore") });
    rmSync(current, { recursive: true, force: true });
    cpSync(outdir, current, { recursive: true });

    const bytes = built.outputs.reduce(( total, output ) => total + output.size, 0);

    report(`Bundled ${identity}: ${built.outputs.length} files, ${Math.round(bytes / 1024)} KiB in dist/${identity}.`);

    return { identity, outdir, bytes, files: built.outputs.length };

}
export async function bundleSpecs ( every: boolean ): Promise<Bundled[]> {

    const specs = every ? installedSpecs() : [specFromEnvironment()];
    const results: Bundled[] = [];

    for ( const identity of specs ) results.push(await bundleSpec(identity));

    return results;

}

task(import.meta.url, async () => {

    await bundleSpecs(process.argv.includes("--all"));

});
