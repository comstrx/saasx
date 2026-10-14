"use client";

import { memo, useState } from "react";
import { emoji } from "@/lib/spec/emoji";

type Props = { glyph: string; language?: "en" | "ar" | undefined; size?: "sm" | "md" | "lg" | "xl" | undefined; label?: string | undefined; selected?: boolean | undefined; onPress?: (( glyph: string ) => void) | undefined };

function Emoji ({ glyph, language = "en", size = "md", label, selected, onPress }: Props) {

    const [broken, setBroken] = useState(false);
    const src = broken ? undefined : emoji.imageOf(glyph);
    const named = label ?? emoji.get(glyph)?.name[language] ?? glyph;
    const face = src
        ? <img className="emoji" data-size={size} src={src} alt={onPress ? "" : named} width={64} height={64} loading="lazy" decoding="async" onError={() => setBroken(true)} />
        : onPress ? <span className="emoji" data-size={size} aria-hidden>{glyph}</span> : <span className="emoji" data-size={size} role="img" aria-label={named}>{glyph}</span>;

    if ( !onPress ) return face;

    return <button type="button" className="emoji-key" aria-label={named} aria-pressed={selected} onClick={() => onPress(glyph)}>{face}</button>;

}

export default memo(Emoji);
