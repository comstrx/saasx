import { defineEmoji, flagCode } from "@engine/world";
import bundled from "@spec/emoji";
import { flagSource } from "./world.ts";

export const emoji = defineEmoji();

export function emojiSource ( glyph: string ): number | undefined {

    const found = emoji.get(glyph);
    const code = found ? flagCode(found.glyph) : undefined;

    if ( !found ) return undefined;

    return code ? flagSource(code) : bundled[found.code];

}
