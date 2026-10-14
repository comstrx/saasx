import { relative, resolve } from "node:path";
import { browserConfig } from "@engine/api";
import { base64 } from "@engine/base";
import { mimeOf } from "@engine/file";
import { settingsResource } from "@engine/spec";
import { type Files, featureFacts, iconFont } from "@engine/tooling";
import { iconAliases, iconNames } from "@engine/ui";
import { defineEmoji } from "@engine/world";
import { countries } from "../../src/lib/spec/theme.ts";
import { root, tools } from "../core/index.ts";

import { themeCss } from "./theme.ts";

function wellKnown ( assets: Files ): Record<string, { type: string; body: string }> {

    const prefix = ".well-known/";
    const entries = [...assets].filter(( [name] ) => name.startsWith(prefix));

    return Object.fromEntries(entries.map(( [name, bytes] ) => [name.slice(prefix.length), { type: mimeOf(name), body: base64(bytes) }]));

}
function mountModule ( folder: string, features: readonly string[] ): string {

    const lines = features.map(( name ) => {

        const entry = relative(resolve(root, folder), resolve(root, "src", "features", name, "index.tsx")).replaceAll("\\", "/");

        return `    ${JSON.stringify(name)}: dynamic(() => import(${JSON.stringify(entry)})),`;

    });

    return `import dynamic from "next/dynamic";\n\nexport default {\n${lines.join("\n")}\n};\n`;

}

export const compileSpec = tools.build(import.meta.url, {
    brand: ( config ) => [config.content.logo, config.content.logo_dark, config.content.icon],
    engine: { flags: countries, emoji: defineEmoji().files({ tones: true }) },
    keep: [".well-known"],
    emit: async ({ spec, config, assets, folder }) => {

        const icons = await iconFont(iconNames, iconAliases, "woff2");
        const facts = await featureFacts(resolve(root, "src", "features"));
        const ownedBy = ( owner: string ) => spec.schema.features.filter(( name ) => facts[name]?.owner === owner);
        const site = spec.config.content.url;
        const origins = Object.values(spec.config.api?.connections ?? {}).flatMap(( connection ) => (connection.baseUrl ? [new URL(connection.baseUrl).origin] : []));

        return {
            data: {
                settings: settingsResource(config.settings),
                browser: config.api ? { ...browserConfig(config.api, config.contract), realtime: config.realtime } : null,
                "well-known": wellKnown(assets),
            },
            registry: ownedBy("server"),
            modules: { "mount.js": mountModule(folder, ownedBy("client")), "theme.css": themeCss(config, assets, icons.bytes) },
            meta: {
                delivery: spec.config.settings.delivery,
                secure: typeof site === "string" && site.startsWith("https://"),
                insecure: spec.config.insecure,
                media: [...new Set([...origins, ...spec.config.settings.mediaOrigins])],
            },
        };

    },
});
