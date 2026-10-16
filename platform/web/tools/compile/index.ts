import { resolve } from "node:path";
import { browserConfig, connectionOrigins } from "engine/api";
import { unique } from "engine/array";
import { base64 } from "engine/base";
import { mimeOf } from "engine/file";
import { settingsResource } from "engine/spec";
import { type Files, featureEntry, featureFacts, iconFont, registryModule } from "engine/tooling";
import { emojis, iconAliases, iconNames } from "engine/world";
import { root, tools } from "../core/index.ts";

import { themeCss } from "./theme.ts";

type Reach = { path: string; features: readonly string[] };

function wellKnown ( assets: Files ): Record<string, { type: string; body: string }> {

    const prefix = ".well-known/";
    const entries = [...assets].filter(( [name] ) => name.startsWith(prefix));

    return Object.fromEntries(entries.map(( [name, bytes] ) => [name.slice(prefix.length), { type: mimeOf(name), body: base64(bytes) }]));

}
function mountModule ( folder: string, names: readonly string[] ): string {

    const views = names.map(( name ) => `    ${JSON.stringify(name)}: dynamic(() => import(${featureEntry(root, folder, name)})),`);

    return `import dynamic from "next/dynamic";\n\nexport default {\n${views.join("\n")}\n};\n`;

}
function preloadModule ( folder: string, names: readonly string[], screens: readonly Reach[] ): string {

    const owned = new Set(names);
    const reach = screens
        .map(( screen ) => ({ path: screen.path, features: screen.features.filter(( name ) => owned.has(name)) }))
        .filter(( screen ) => screen.features.length);

    return `export const screens = ${JSON.stringify(reach)};\n\n${registryModule(root, folder, names)}`;

}

export const compileSpec = tools.build(import.meta.url, {
    brand: ( config ) => [config.content.logo, config.content.logo_dark, config.content.icon],
    engine: { flags: true, emoji: emojis.files, fonts: true },
    keep: [".well-known"],
    emit: async ({ spec, config, assets, folder }) => {

        const icons = await iconFont(iconNames, iconAliases, "woff2");
        const facts = await featureFacts(resolve(root, "src", "features"));
        const ownedBy = ( owner: string ) => spec.schema.features.filter(( name ) => facts[name]?.owner === owner);
        const site = spec.config.content.url;
        const origins = connectionOrigins(spec.config.api);

        return {
            data: {
                settings: settingsResource(config.settings),
                browser: config.api ? { ...browserConfig(config.api, config.contract), realtime: config.realtime } : null,
                "well-known": wellKnown(assets),
            },
            registry: ownedBy("server"),
            modules: {
                "mount.js": mountModule(folder, ownedBy("client")),
                "preload.js": preloadModule(folder, ownedBy("client"), spec.schema.screens),
                "theme.css": themeCss(config, assets, icons.bytes),
            },
            meta: {
                delivery: spec.config.settings.delivery,
                secure: typeof site === "string" && site.startsWith("https://"),
                insecure: spec.config.insecure,
                media: unique([...origins, ...spec.config.settings.mediaOrigins]),
            },
        };

    },
});
