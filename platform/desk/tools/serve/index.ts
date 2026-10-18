import { report, task } from "engine/tooling";
import { compileSpec } from "../compile/index.ts";
import { specFromEnvironment } from "../core/index.ts";

export const port = 1420;

task(import.meta.url, async () => {

    const identity = specFromEnvironment();

    process.env.DESK_SPEC = identity;
    process.env.NODE_ENV = "development";

    await compileSpec("development");

    const { default: page } = await import("../../index.html");

    Bun.serve({
        port,
        development: { hmr: true, console: true },
        routes: { "/*": page },
    });

    report(`Serving ${identity} on http://localhost:${port} with hot reloading.`);

});
