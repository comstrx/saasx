import { browserConfig } from "engine/api";
import { flagFiles, generatedRoot, iconFont, requireModule, staticFonts } from "engine/tooling";
import { emojis, iconAliases, iconNames } from "engine/world";
import { root, tools } from "../core/index.ts";

const stem = ( file: string ): string => file.slice(0, file.lastIndexOf("."));
const weights = [400, 600, 700];

export const compileSpec = tools.build(import.meta.url, {
    brand: ( config ) => [config.content.logo, config.content.icon],
    emit: async ({ spec, config, folder }) => {

        const icons = await iconFont(iconNames, iconAliases, "truetype");
        const flags = flagFiles("webp");
        const faces = await staticFonts(weights);

        return {
            data: { client: config.api ? browserConfig(config.api, config.contract) : null },
            modules: {
                "flags.js": requireModule(root, folder, flags.map(( file ) => ({ name: stem(file), from: "flag", file }))),
                "emoji.js": requireModule(root, folder, emojis.files.map(( file ) => ({ name: stem(file), from: "emoji", file }))),
            },
            publish: new Map([["fonts/lucide.ttf", icons.bytes], ...faces.map(( face ) => [`fonts/${face.file}`, face.bytes] as const)]),
            meta: {
                insecure: spec.config.insecure,
                icons: `${generatedRoot}/fonts/lucide.ttf`,
                fonts: [...Map.groupBy(faces, ( face ) => face.family)].map(( [family, list] ) => ({
                    fontFamily: family,
                    fontDefinitions: list.map(( face ) => ({ path: `${generatedRoot}/fonts/${face.file}`, weight: face.weight })),
                })),
                app: {
                    name: config.content.name,
                    slug: config.settings.app.slug,
                    scheme: config.settings.app.scheme,
                    icon: config.content.icon ? `public${config.content.icon}` : null,
                    background: config.theme.colors.light.body ?? "#ffffff",
                },
            },
            note: `${emojis.files.length} emoji, ${flags.length} flags and ${faces.length} font weights bundled`,
        };

    },
});
