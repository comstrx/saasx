import { createIcons, glyphs, type IconNode } from "@engine/ui";
import { createElement } from "react";

const icons = createIcons<IconNode>(glyphs, glyphs.circle);

type Props = { name: string; label?: string | undefined; size?: "sm" | "md" | undefined };

export default function Icon ({ name, label, size = "md" }: Props) {
    const nodes = icons.get(name);

    return (

        <svg
            className="icon" data-size={size} viewBox="0 0 24 24" width={24} height={24}
            fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} focusable={false}
        >

            {nodes.map(( [tag, attrs] ) => createElement(tag, { key: `${tag}:${Object.values(attrs).join(",")}`, ...attrs }))}

        </svg>

    );
}
