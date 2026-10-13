import { resolve } from "node:path";
import { browserConfig } from "@engine/api";
import { defineEmoji } from "@engine/emoji";
import { assetBudget, assetHash, brandImages, flagsModule, type Mode, modeOf, type Required, registryModule, report, requireModule, routingOf, selectConnections, sha256, specAliases, task } from "@engine/tooling";
import { countries, emoji } from "../../src/lib/spec/theme.ts";
import { assetFiles, composeAssets, specPaths } from "../assets/index.ts";
import { loadSpec, root, type Spec, specFromEnvironment, writeFile, writeJson } from "../core/index.ts";

const emojiBudget = Number(process.env.EMOJI_BUDGET ?? 4 * 1048576);

export function emojiEntries (): Required[] {

    const files = defineEmoji({ animated: emoji.animated }).files();

    return [
        ...files.static.map(( file ) => ({ name: `static/${file}`, from: "emoji/static", file })),
        ...files.animated.map(( file ) => ({ name: `animated/${file}`, from: "emoji/animated", file })),
    ];

}
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
    const assets = composeAssets(resolve(root, "public"), resolve(spec.folder, "brand"));
    const folder = `node_modules/.cache/spec/${mode}`;
    const data = assemble(spec, mode);
    const shared = [...assetFiles(resolve(root, "public"), true)];
    const files = new Map([...shared, ...assets]);
    const { content, theme } = spec.config;

    brandImages([content.logo, content.icon], assets);

    for ( const [name, value] of Object.entries(data) ) writeJson(`${folder}/${name}.json`, value);
    for ( const [name, bytes] of assets ) writeFile(`${folder}/assets/${name}`, bytes);

    writeFile(`${folder}/registry.js`, registryModule(root, folder, spec.schema.features));
    writeFile(`${folder}/flags.js`, flagsModule(root, folder, countries, "webp"));

    const bundled = emojiEntries();
    const emojiBytes = assetBudget(bundled, emojiBudget, "emoji");

    writeFile(`${folder}/emoji.js`, requireModule(root, folder, bundled));
    writeJson(`${folder}/release.json`, { identity: spec.identity, files: [...files].map(( [path, bytes] ) => ({ path, sha256: sha256(bytes) })) });

    const meta = {
        identity: spec.identity,
        insecure: spec.config.insecure,
        assetRoot: `${folder}/assets`,
        assetHash: assetHash(assets),
        paths: specPaths,
        aliases: specAliases(root, folder, Object.keys(data), { "@spec/flags": "flags.js", "@spec/emoji": "emoji.js" }),
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

    report(`Compiled ${spec.identity}: ${screens.length} screen(s), ${features.length} feature(s), ${operations.length} operation(s), ${assets.size} spec assets, ${bundled.length} emoji (${(emojiBytes / 1048576).toFixed(2)} MB).`);

    return meta;

}

task(import.meta.url, async () => {

    await compileSpec(modeOf(process.argv[2]));

});
