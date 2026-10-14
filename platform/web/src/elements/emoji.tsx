"use client";

import type { EmojiContext } from "@engine/world";
import { type CSSProperties, memo, useState } from "react";
import { emoji } from "@/lib/spec/emoji";

type Props = { glyph: string; context?: EmojiContext | undefined; active?: boolean | undefined; size?: "sm" | "md" | "lg" | "xl" | undefined; label?: string | undefined; selected?: boolean | undefined; onPress?: (( glyph: string ) => void) | undefined };

function Emoji ({ glyph, context = "standalone", active = false, size = "md", label, selected, onPress }: Props) {

    const [round, setRound] = useState(0);
    const shown = emoji.display(glyph, { context, active });
    const named = label ?? emoji.get(glyph)?.name.en ?? glyph;

    if ( onPress && shown.kind !== "animated" ) {

        return (

            <button type="button" className="emoji-key" aria-label={named} aria-pressed={selected} onClick={() => onPress(glyph)}>

                {shown.kind === "static" ? <img className="emoji" data-size={size} src={shown.src} alt="" width={64} height={64} loading="lazy" decoding="async" /> : <span className="emoji" data-size={size}>{shown.glyph}</span>}

            </button>

        );

    }

    if ( shown.kind === "glyph" ) return <span className="emoji" data-size={size} role="img" aria-label={named}>{shown.glyph}</span>;
    if ( shown.kind === "static" ) return <img className="emoji" data-size={size} src={shown.src} alt={named} width={64} height={64} loading="lazy" decoding="async" />;

    const { sprite } = shown;
    const motion = { backgroundImage: `url(${sprite.src})`, "--columns": sprite.columns, "--rows": sprite.rows, "--ms": `${sprite.ms}ms` } as CSSProperties;

    return (

        <button type="button" className="emoji" data-size={size} aria-label={named} onClick={() => setRound(round + 1)}>

            <span key={round} className="emoji-motion" style={motion} />

        </button>

    );

}

export default memo(Emoji);
