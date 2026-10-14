import { browserConfig } from "@engine/api";
import { assetBudget, flagsModule, generatedRoot, iconFont, type Required, requireModule } from "@engine/tooling";
import { iconAliases, iconNames } from "@engine/ui";
import { defineEmoji } from "@engine/world";
import { countries, emoji } from "../../src/lib/spec/theme.ts";
import { root, tools } from "../core/index.ts";

const emojiBudget = Number(process.env.EMOJI_BUDGET ?? 256 * 1024);

export function emojiEntries (): Required[] {

    const catalog = defineEmoji();
    const files = new Set(emoji.bundled.flatMap(( glyph ) => {

        const still = catalog.staticOf(glyph);

        return still ? [still.slice(still.lastIndexOf("/") + 1)] : [];

    }));

    return [...files].map(( file ) => ({ name: `static/${file}`, from: "emoji/static", file }));

}

export const compileSpec = tools.build(import.meta.url, {
    brand: ( config ) => [config.content.logo, config.content.icon],
    emit: async ({ spec, config, folder }) => {

        const bundled = emojiEntries();
        const bytes = assetBudget(bundled, emojiBudget, "emoji");
        const icons = await iconFont(iconNames, iconAliases, "truetype");

        return {
            data: { client: config.api ? browserConfig(config.api, config.contract) : null },
            modules: { "flags.js": flagsModule(root, folder, countries, "webp"), "emoji.js": requireModule(root, folder, bundled) },
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
            note: `${bundled.length} emoji (${(bytes / 1048576).toFixed(2)} MB)`,
        };

    },
});
