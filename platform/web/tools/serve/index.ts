import { cpSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { task } from "engine/tooling";

const root = resolve(import.meta.dir, "../..");
const dist = resolve(root, ".next", "out");
const standalone = resolve(dist, "standalone");

export function serverOf ( paths: Iterable<string> ): string | undefined {

    return [...paths].filter(( path ) => !path.includes("node_modules")).sort(( a, b ) => a.length - b.length)[0];

}

task(import.meta.url, async () => {

    const server = existsSync(standalone) ? serverOf(new Bun.Glob("**/server.js").scanSync({ cwd: standalone })) : undefined;

    if ( !server ) throw new Error("There is no standalone build to serve; run bun run build first.");

    const app = dirname(resolve(standalone, server));

    cpSync(resolve(root, "public"), resolve(app, "public"), { recursive: true });
    cpSync(resolve(dist, "static"), resolve(app, ".next", "out", "static"), { recursive: true });
    process.env.PORT ??= "3000";
    process.env.HOSTNAME ??= "0.0.0.0";

    await import(resolve(standalone, server));

});
