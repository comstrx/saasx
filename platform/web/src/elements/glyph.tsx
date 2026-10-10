import type { Icon as IconGlyph } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof icon> & {
    glyph: IconGlyph;
    weight?: "regular" | "fill" | "bold";
    label?: string;
};

const icon = tv({
    base: "shrink-0",
    variants: {
        size: { inherit: "", xs: "size-3.5", sm: "size-4", md: "size-5", lg: "size-6", xl: "size-7" },
        tone: {
            inherit: "",
            ink: "text-ink",
            muted: "text-muted",
            accent: "text-accent",
            primary: "text-primary",
            success: "text-success",
            danger: "text-danger",
            ember: "text-ember",
        },
        mirrored: { true: "rtl:-scale-x-100" },
    },
    defaultVariants: { size: "inherit", tone: "inherit" },
});

export default function Glyph ({ glyph: Shape, weight = "regular", label, size, tone, mirrored }: Props) {

    return (

        <Shape
            weight={weight}
            aria-hidden={label ? undefined : true}
            aria-label={label}
            role={label ? "img" : undefined}
            className={icon({ size, tone, mirrored })}
        />

    );

}
