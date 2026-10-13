import type { Context } from "@engine/emoji";
import { emoji } from "@/lib/spec/emoji";

type Props = { glyph: string; context?: Context | undefined; active?: boolean | undefined; size?: "sm" | "md" | "lg" | undefined };

export default function Emoji ({ glyph, context = "standalone", active = false, size = "md" }: Props) {

    const shown = emoji.display(glyph, { context, active });
    const label = emoji.get(glyph)?.name.en ?? glyph;

    if ( shown.kind === "glyph" ) return <span className="emoji" data-size={size} role="img" aria-label={label}>{shown.glyph}</span>;
    if ( shown.kind === "static" ) return <img className="emoji" data-size={size} src={shown.src} alt={label} width={64} height={64} loading="lazy" decoding="async" />;

    return (

        <picture>

            <source media="(prefers-reduced-motion: no-preference)" srcSet={shown.src} type="image/webp" />

            <img className="emoji" data-size={size} src={emoji.staticOf(glyph) ?? shown.src} alt={label} width={64} height={64} decoding="async" />

        </picture>

    );

}
