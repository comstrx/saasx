import { $ } from "bun";
import { report, task } from "engine/tooling";
import { installedSpecs, specFromEnvironment } from "../core/index.ts";

export async function buildSpecs ( every: boolean ): Promise<string[]> {

    const specs = every ? installedSpecs() : [specFromEnvironment()];

    for ( const spec of specs ) {

        const env = { ...process.env, NEXT_PUBLIC_SPEC: spec };

        report(`build ${spec}`);
        await $`bun tools/compile/index.ts production`.env(env);
        await $`bunx next build`.env(env);

    }

    return specs;

}

task(import.meta.url, async () => {

    await buildSpecs(process.argv.includes("--all"));

});
