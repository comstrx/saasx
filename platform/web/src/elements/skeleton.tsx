import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof skeleton> & { lines?: number };

const skeleton = tv({
    base: "skeleton block shrink-0",
    variants: {
        shape: {
            text: "h-3.5 rounded-sm",
            title: "h-6 rounded-md",
            heading: "h-9 rounded-lg",
            avatar: "size-11 rounded-full",
            pebble: "size-11 rounded-xl",
            card: "aspect-(--aspect-card) rounded-2xl",
            media: "aspect-(--aspect-wide) rounded-3xl",
            button: "h-11 w-28 rounded-lg",
            chip: "h-9 w-24 rounded-full",
            field: "h-12 rounded-lg",
            block: "h-full min-h-24 rounded-3xl",
        },
        width: { full: "w-full", half: "w-1/2", third: "w-1/3", quarter: "w-1/4", "two-thirds": "w-2/3", auto: "" },
    },
    defaultVariants: { shape: "text", width: "full" },
});

export default function Skeleton ({ shape, width, lines = 1 }: Props) {

    if ( lines > 1 ) return (

        <span aria-hidden="true" className="flex w-full flex-col gap-2.5">

            {Array.from({ length: lines }, ( _, index ) => `line-${index + 1}`).map(( line ) => (

                <span key={line} className={skeleton({ shape, width: line === `line-${lines}` ? "two-thirds" : width })} />

            ))}

        </span>

    );

    return <span aria-hidden="true" className={skeleton({ shape, width })} />;

}
