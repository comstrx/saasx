import { browserConfig } from "engine/api";
import { iconFont, themeCss } from "engine/tooling";
import { iconAliases, iconNames } from "engine/world";
import { motion, radius, space, type } from "../../src/lib/spec/theme.ts";
import { tools } from "../core/index.ts";
import { hostConfig } from "./host.ts";

export const compileSpec = tools.build(import.meta.url, {
    brand: ( config ) => [config.content.logo, config.content.logo_dark, config.content.icon],
    engine: { fonts: true },
    emit: async ({ spec, config, assets }) => {

        const icons = await iconFont(iconNames, iconAliases, "woff2");
        const { app, window, permissions, locale, fonts } = config.settings;
        const host = hostConfig({ identity: spec.identity, name: config.content.name, app, window, permissions });

        return {
            data: {
                client: config.api ? browserConfig(config.api, config.contract) : null,
                host,
            },
            modules: {
                "theme.css": themeCss({ colors: config.theme.colors, fonts, locales: locale.enabled, tokens: { space, radius, type }, motion, assets, icons: icons.bytes }),
            },
            meta: { insecure: spec.config.insecure, name: config.content.name, slug: app.slug, identifier: app.identifier },
        };

    },
});
