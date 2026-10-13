import { createIcons } from "@engine/ui";
import { fallback, type Glyph, glyphs } from "@/lib/providers/icons";
import { usePalette } from "@/styles/palette";

const icons = createIcons<Glyph>(glyphs, fallback);
const sizes = { sm: 16, md: 20 } as const;

type Props = { name: string; label?: string | undefined; size?: "sm" | "md" | undefined; tone?: "ink" | "muted" | "primary" | "inverse" | undefined };

export default function Icon ({ name, label, size = "md", tone = "ink" }: Props) {

    const palette = usePalette();
    const Draw = icons.get(name);
    const colors = { ink: palette.ink, muted: palette.muted, primary: palette.primary, inverse: palette.panel };
    const color: string = colors[tone] ?? "currentColor";

    return <Draw size={sizes[size]} color={color} accessibilityElementsHidden={!label} importantForAccessibility={label ? "yes" : "no"} {...(label ? { accessibilityLabel: label } : {})} />;

}
