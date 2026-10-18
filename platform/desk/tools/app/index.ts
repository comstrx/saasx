import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { $ } from "bun";
import { report, task } from "engine/tooling";
import { bundleSpec } from "../bundle/index.ts";
import { installedSpecs, specFromEnvironment } from "../core/index.ts";

export type Built = { identity: string; binary: string };

const root = resolve(import.meta.dir, "../..");
const suffix = process.platform === "win32" ? ".exe" : "";

function host ( identity: string ): string {

    const path = resolve(root, "node_modules/.cache/spec/production/host.json");
    const value = JSON.parse(readFileSync(path, "utf8")) as { productName: string };

    if ( value.productName !== identity ) throw new Error(`The compiled host belongs to ${value.productName}, not ${identity}.`);

    return JSON.stringify({ ...value, build: { frontendDist: `../dist/${identity}` } });

}
export async function buildApp ( identity: string, debug: boolean, target: string | undefined ): Promise<Built> {

    await bundleSpec(identity);

    const config = host(identity);
    const profile = debug ? "debug" : "release";
    const flags = [...(debug ? ["--debug"] : []), ...(target ? ["--target", target] : []), "--no-bundle", "--config", config];

    report(`Building the ${identity} app (${profile}${target ? `, ${target}` : ""}).`);
    await $`bunx tauri build ${flags}`.cwd(root).env({ ...process.env, DESK_SPEC: identity });

    const built = resolve(root, "src-tauri/target", ...(target ? [target] : []), profile, `desk${suffix}`);
    const out = resolve(root, "dist", "apps");
    const binary = resolve(out, `${identity}${suffix}`);

    if ( !existsSync(built) ) throw new Error(`No binary at ${built}.`);

    mkdirSync(out, { recursive: true });
    copyFileSync(built, binary);
    report(`Built ${identity}: ${binary}`);

    return { identity, binary };

}

task(import.meta.url, async () => {

    const every = process.argv.includes("--all");
    const debug = process.argv.includes("--debug");
    const at = process.argv.indexOf("--target");
    const target = at === -1 ? undefined : process.argv[at + 1];
    const specs = every ? installedSpecs() : [specFromEnvironment()];

    for ( const identity of specs ) await buildApp(identity, debug, target);

});
