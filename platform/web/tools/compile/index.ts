import { resolve } from "node:path";
import { browserConfig } from "@engine/api";
import { settingsResource } from "@engine/spec";
import { assetHash, brandImages, type Files, type Mode, modeOf, registryModule, report, routingOf, selectConnections, sha256, specAliases, task } from "@engine/tooling";
import type { CompiledConfig } from "../../src/lib/spec/surface.ts";
import { countries } from "../../src/lib/spec/theme.ts";
import { assetFiles, composeAssets, specPaths } from "../assets/index.ts";
import { loadSpec, root, type Spec, specFromEnvironment, writeFile, writeJson } from "../core/index.ts";

import { themeCss } from "./theme.ts";

function forMode ( config: CompiledConfig, mode: Mode ): CompiledConfig {

    return config.api ? { ...config, api: { ...config.api, connections: selectConnections(config.api.connections, mode) } } : config;

}
function owned ( name: string ): boolean {

    return specPaths.some(( path ) => name.startsWith(`${path}/`));

}
export function assemble ( spec: Spec, assets: Files, mode: Mode ) {

    const config = forMode(spec.config, mode);

    brandImages([config.content.logo, config.content.logo_dark, config.content.icon], assets);

    return {
        assetRoot: `/_generated/${mode}/${assetHash(assets)}`,
        css: themeCss(config, assets),
        data: {
            config,
            schema: spec.schema,
            messages: spec.messages,
            routing: routingOf(config.settings),
            settings: settingsResource(config.settings),
            browser: config.api ? { ...browserConfig(config.api, config.contract), realtime: config.realtime } : null,
        },
    };

}
export async function compileSpec ( mode: Mode ) {

    const spec = await loadSpec(specFromEnvironment());
    const assets = composeAssets(resolve(root, "public"), resolve(spec.folder, "brand"));
    const flags = assetFiles(resolve(root, "public/images/flag"), true);
    const missing = countries.filter(( code ) => !flags.has(`${code.toLowerCase()}.svg`));

    if ( missing.length ) throw new Error(`Missing flags: ${missing.join(", ")}`);
    const folder = `node_modules/.cache/spec/${mode}`;
    const { assetRoot, css, data } = assemble(spec, assets, mode);
    const shared = [...assetFiles(resolve(root, "public"), true)].filter(( [name] ) => !owned(name));
    const files = new Map([...shared, ...assets]);

    for ( const [name, value] of Object.entries(data) ) writeJson(`${folder}/${name}.json`, value);

    writeFile(`${folder}/registry.js`, registryModule(root, folder, spec.schema.features));
    writeFile(`${folder}/theme.css`, css);
    writeJson(`${folder}/release.json`, { identity: spec.identity, files: [...files].map(( [path, bytes] ) => ({ path, sha256: sha256(bytes) })) });

    if ( mode === "development" ) {

        for ( const [name, bytes] of assets ) writeFile(`public${assetRoot}/${name}`, bytes);

    }

    const { screens, features, operations } = spec.schema;

    report(`Compiled ${spec.identity}: ${screens.length} screen(s), ${features.length} feature(s), ${operations.length} operation(s), ${assets.size} spec assets.`);

    const meta = { identity: spec.identity, delivery: spec.config.settings.delivery, assetRoot, paths: specPaths, aliases: specAliases(root, folder, Object.keys(data), { "@spec/theme.css": "theme.css" }) };

    writeJson(`${folder}/meta.json`, meta);

    return meta;

}

task(import.meta.url, async () => {

    await compileSpec(modeOf(process.argv[2]));

});
