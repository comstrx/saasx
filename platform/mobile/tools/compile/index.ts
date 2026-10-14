import { browserConfig } from "@engine/api";
import { flagFiles, generatedRoot, iconFont, requireModule } from "@engine/tooling";
import { emojis, iconAliases, iconNames } from "@engine/world";
import { root, tools } from "../core/index.ts";

const stem = ( file: string ): string => file.slice(0, file.lastIndexOf("."));

export const compileSpec = tools.build(import.meta.url, {
    brand: ( config ) => [config.content.logo, config.content.icon],
    emit: async ({ spec, config, folder }) => {

        const icons = await iconFont(iconNames, iconAliases, "truetype");
        const flags = flagFiles("webp");

        return {
            data: { client: config.api ? browserConfig(config.api, config.contract) : null },
            modules: {
                "flags.js": requireModule(root, folder, flags.map(( file ) => ({ name: stem(file), from: "flag", file }))),
                "emoji.js": requireModule(root, folder, emojis.files.map(( file ) => ({ name: stem(file), from: "emoji", file }))),
            },
            publish: new Map([["fonts/lucide.ttf", icons.bytes]]),
            meta: {
                insecure: spec.config.insecure,
                icons: `${generatedRoot}/fonts/lucide.ttf`,
                app: {
                    name: config.content.name,
                    slug: config.settings.app.slug,
                    scheme: config.settings.app.scheme,
                    icon: config.content.icon ? `public${config.content.icon}` : null,
                    background: config.theme.colors.light.body ?? "#ffffff",
                },
            },
            note: `${emojis.files.length} emoji and ${flags.length} flags bundled`,
        };

    },
});
