import { $ } from "bun";
import { report, task } from "engine/tooling";
import { installedSpecs, specFromEnvironment } from "../core/index.ts";

export async function exportSpecs ( every: boolean ): Promise<string[]> {

    const specs = every ? installedSpecs() : [specFromEnvironment()];

    for ( const spec of specs ) {

        const env = { ...process.env, EXPO_PUBLIC_SPEC: spec, NODE_ENV: "production" };

        report(`export ${spec}`);
        await $`bun tools/compile/index.ts production`.env(env);
        await $`bunx expo export --platform android --output-dir .expo/export`.env(env);

    }

    return specs;

}

task(import.meta.url, async () => {

    await exportSpecs(process.argv.includes("--all"));

});
