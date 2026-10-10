import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof flag> & { code: string; label?: string };

const flag = tv({
    base: "shrink-0 object-cover ring-1 ring-edge",
    variants: {
        size: { small: "h-4 w-6 rounded-2xs", medium: "h-5 w-7 rounded-xs", large: "h-6 w-8 rounded-xs" },
        shape: { rect: "", round: "aspect-square w-auto rounded-full" },
    },
    defaultVariants: { size: "small", shape: "rect" },
});

export default function Flag ({ code, label = "", size, shape }: Props) {

    return (

        <picture className="contents">

            <img src={`/assets/images/flag/${code.toLowerCase()}.svg`} alt={label} decoding="async" className={flag({ size, shape })} />

        </picture>

    );

}
