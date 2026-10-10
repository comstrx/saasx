import { createTV } from "tailwind-variants";

export { cn, type VariantProps } from "tailwind-variants";

export const tv = createTV({
    twMergeConfig: {
        extend: {
            theme: {
                text: ["display", "headline", "h1", "h2", "h3", "title", "value", "small", "label", "micro"],
                shadow: ["e1", "e2", "e3", "e4"],
                radius: ["bar"],
            },
        },
    },
});
