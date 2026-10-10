"use client";

import type { Route } from "next";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { Menu as Base } from "@/lib/providers/ui";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Entry = {
    key: string;
    label: string;
    icon?: ReactNode;
    meta?: ReactNode;
    href?: string;
    tone?: "default" | "danger";
    disabled?: boolean;
    current?: boolean;
    checked?: boolean;
    onSelect?: () => void;
};
type Section = { key: string; label?: string; items: readonly Entry[] };
type Props = VariantProps<typeof menu> & {
    label: string;
    trigger: ReactNode;
    header?: ReactNode;
    sections: readonly Section[];
    align?: "start" | "center" | "end";
    onOpenChange?: ( open: boolean ) => void;
};

const menu = tv({
    slots: {
        trigger: "",
        popup: "menu-popup popup-motion popup-frame",
    },
    variants: {
        look: {
            pebble: { trigger: "pebble" },
            button: { trigger: "btn btn-outline btn-md data-popup-open:border-field" },
            chip: { trigger: "chip data-popup-open:border-field" },
            ghost: { trigger: "btn btn-ghost btn-sm btn-icon" },
            avatar: { trigger: "inline-flex shrink-0 cursor-pointer rounded-full press-motion" },
        },
        width: { small: { popup: "w-56" }, medium: { popup: "w-72" }, large: { popup: "w-90" } },
    },
    defaultVariants: { look: "pebble", width: "medium" },
});

function Item ({ entry }: { entry: Entry }) {

    const tone = entry.tone === "danger" ? "menu-item menu-item-danger" : "menu-item";
    const body = (

        <>

            {entry.icon}

            <span className="min-w-0 flex-1 truncate" dir="auto">{entry.label}</span>

            {entry.meta ? <span className="shrink-0 text-label text-muted">{entry.meta}</span> : null}

        </>

    );

    if ( entry.checked !== undefined ) return (

        <Base.CheckboxItem checked={entry.checked} onCheckedChange={() => entry.onSelect?.()} closeOnClick={false} className={tone}>

            {entry.icon}

            <span className="min-w-0 flex-1 truncate" dir="auto">{entry.label}</span>

            <span aria-hidden="true" data-checked={entry.checked || undefined} className="switch-root pointer-events-none">

                <span data-checked={entry.checked || undefined} className="switch-thumb" />

            </span>

        </Base.CheckboxItem>

    );
    if ( entry.href ) return (

        <Base.LinkItem
            render={<NextLink href={entry.href as Route} prefetch={false} />}
            aria-current={entry.current ? "page" : undefined}
            className={tone}
        >

            {body}

        </Base.LinkItem>

    );

    return <Base.Item disabled={entry.disabled} onClick={entry.onSelect} className={tone}>{body}</Base.Item>;

}
export default function Menu ({ label, trigger, header, sections, align = "end", look, width, onOpenChange }: Props) {

    const styles = menu({ look, width });

    return (

        <Base.Root onOpenChange={onOpenChange}>

            <Base.Trigger aria-label={label} className={styles.trigger()}>{trigger}</Base.Trigger>

            <Base.Portal>

                <Base.Positioner side="bottom" align={align} sideOffset={10} collisionPadding={12} className="z-60">

                    <Base.Popup className={styles.popup()}>

                        {header ? <div className="menu-header">{header}</div> : null}

                        {sections.map(( section, index ) => (

                            <Base.Group key={section.key}>

                                {index > 0 ? <Base.Separator className="menu-separator" /> : null}

                                {section.label ? <Base.GroupLabel className="menu-label">{section.label}</Base.GroupLabel> : null}

                                {section.items.map(( entry ) => <Item key={entry.key} entry={entry} />)}

                            </Base.Group>

                        ))}

                    </Base.Popup>

                </Base.Positioner>

            </Base.Portal>

        </Base.Root>

    );

}
