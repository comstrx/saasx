import bundled from "@spec/emoji";
import { flagCode } from "engine/world";
import { flagSource, world } from "./world.ts";

export function emojiSource ( glyph: string ): number | undefined {

    const found = world.emojis.get(glyph);

    if ( !found ) return undefined;

    const code = flagCode(found.glyph);

    return code ? flagSource(code) : bundled[found.code];

}
