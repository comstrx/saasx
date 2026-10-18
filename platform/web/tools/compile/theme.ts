import { themeCss as css } from "engine/tooling";
import type { CompiledConfig } from "../../src/lib/spec/surface.ts";
import { motion, radius, space, type } from "../../src/lib/spec/theme.ts";

export function themeCss ( config: CompiledConfig, assets: ReadonlyMap<string, Uint8Array>, icons: Uint8Array ): string {

    return css({
        colors: config.theme.colors,
        fonts: config.settings.fonts,
        locales: config.settings.locale.enabled,
        tokens: { space, radius, type },
        motion,
        assets,
        icons,
    });

}
