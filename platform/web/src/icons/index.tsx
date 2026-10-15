import { iconGlyph, iconMirrored } from "engine/world";

type Props = { name: string; label?: string | undefined; size?: "sm" | "md" | undefined };

export default function Icon ({ name, label, size = "md" }: Props) {

    const glyph = iconGlyph(name);
    const mirror = iconMirrored(name) ? "" : undefined;

    if ( label ) return <span className="icon" data-size={size} data-mirror={mirror} role="img" aria-label={label}>{glyph}</span>;

    return <span className="icon" data-size={size} data-mirror={mirror} aria-hidden>{glyph}</span>;

}
