import { defineEmoji } from "@engine/emoji";
import bundled from "@spec/emoji";
import { emoji as chosen } from "./theme.ts";

const folder = "images/emoji";

export const emoji = defineEmoji({ folder, animated: chosen.animated });

export function emojiSource ( src: string ): number | undefined {

    return bundled[src.startsWith(`${folder}/`) ? src.slice(folder.length + 1) : src];

}
