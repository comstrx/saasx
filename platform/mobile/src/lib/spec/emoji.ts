import { defineEmoji, emojiFolder } from "@engine/world";
import bundled from "@spec/emoji";
import { config } from "./runtime.ts";

export type EmojiSource = number | { uri: string };

export const emoji = defineEmoji();

export function emojiSource ( src: string ): EmojiSource | undefined {

    const local = bundled[src.slice(emojiFolder.length + 1)];

    if ( local !== undefined ) return local;

    return config.assets ? { uri: `${config.assets}${src}` } : undefined;

}
