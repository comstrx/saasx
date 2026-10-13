import { createIcons } from "@engine/ui";
import { fallback, type Glyph, glyphs } from "@/lib/providers/icons";

const icons = createIcons<Glyph>(glyphs, fallback);

type Props = { name: string; label?: string | undefined; size?: "sm" | "md" | undefined };

export default function Icon ({ name, label, size = "md" }: Props) {

    const Draw = icons.get(name);

    return <Draw className="icon" data-size={size} aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} focusable={false} />;

}
