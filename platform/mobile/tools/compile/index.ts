import { resolve } from "node:path";
import { browserConfig } from "@engine/api";
import { assetHash, brandImages, type Mode, modeOf, registryModule, report, routingOf, selectConnections, sha256, specAliases, task } from "@engine/tooling";
import { assetFiles, composeAssets, specPaths } from "../assets/index.ts";
import { loadSpec, root, type Spec, specFromEnvironment, writeFile, writeJson } from "../core/index.ts";

export function assemble ( spec: Spec, mode: Mode ) {

    const { config } = spec;
    const api = config.api ? { ...config.api, connections: selectConnections(config.api.connections, mode) } : null;

    return {
        config: { ...config, api },
        schema: spec.schema,
        messages: spec.messages,
        routing: routingOf(config.settings),
        client: api ? browserConfig(api, config.contract) : null,
    };

}
export async function compileSpec ( mode: Mode ) {

    const spec = await loadSpec(specFromEnvironment());
    const assets = composeAssets(resolve(root, "assets"), resolve(spec.folder, "brand"));
    const folder = `node_modules/.cache/spec/${mode}`;
    const data = assemble(spec, mode);
    const shared = [...assetFiles(resolve(root, "assets"), true)];
    const files = new Map([...shared, ...assets]);
    const { content, theme } = spec.config;

    brandImages([content.logo, content.icon], assets);

    for ( const [name, value] of Object.entries(data) ) writeJson(`${folder}/${name}.json`, value);
    for ( const [name, bytes] of assets ) writeFile(`${folder}/assets/${name}`, bytes);

    writeFile(`${folder}/registry.js`, registryModule(root, folder, spec.schema.features));
    writeJson(`${folder}/release.json`, { identity: spec.identity, files: [...files].map(( [path, bytes] ) => ({ path, sha256: sha256(bytes) })) });

    const meta = {
        identity: spec.identity,
        assetRoot: `${folder}/assets`,
        assetHash: assetHash(assets),
        paths: specPaths,
        aliases: specAliases(root, folder, Object.keys(data)),
        app: {
            name: content.name,
            slug: spec.config.settings.app.slug,
            scheme: spec.config.settings.app.scheme,
            icon: content.icon ? `${folder}/assets${content.icon}` : null,
            background: theme.colors.light.body ?? "#ffffff",
        },
    };

    writeJson(`${folder}/meta.json`, meta);

    const { screens, features, operations } = spec.schema;

    report(`Compiled ${spec.identity}: ${screens.length} screen(s), ${features.length} feature(s), ${operations.length} operation(s), ${assets.size} spec assets.`);

    return meta;

}

task(import.meta.url, async () => {

    await compileSpec(modeOf(process.argv[2]));

});
