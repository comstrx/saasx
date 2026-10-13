import { createIcons, glyphs, type IconNode } from "@engine/ui";
import { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect, Svg } from "@/lib/providers/svg";
import { usePalette } from "@/styles/palette";

const icons = createIcons<IconNode>(glyphs, glyphs.circle);
const sizes = { sm: 16, md: 20 } as const;
const shapes = { circle: Circle, ellipse: Ellipse, line: Line, path: Path, polygon: Polygon, polyline: Polyline, rect: Rect } as const;

type Props = { name: string; label?: string | undefined; size?: "sm" | "md" | undefined; tone?: "ink" | "muted" | "primary" | "inverse" | undefined };

export default function Icon ({ name, label, size = "md", tone = "ink" }: Props) {

    const palette = usePalette();
    const nodes = icons.get(name);
    const colors = { ink: palette.ink, muted: palette.muted, primary: palette.primary, inverse: palette.panel };
    const color: string = colors[tone] ?? "currentColor";

    return (

        <Svg
            width={sizes[size]} height={sizes[size]} viewBox="0 0 24 24"
            fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            accessibilityElementsHidden={!label} importantForAccessibility={label ? "yes" : "no"} {...(label ? { accessibilityLabel: label } : {})}
        >

            {nodes.map(( [tag, attrs] ) => {

                const Shape = shapes[tag as keyof typeof shapes];

                return Shape ? <Shape key={`${tag}:${Object.values(attrs).join(",")}`} {...attrs} /> : null;

            })}

        </Svg>

    );

}
