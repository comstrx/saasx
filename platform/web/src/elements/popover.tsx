"use client";

import type { ReactNode } from "react";
import { X } from "@/lib/providers/icons";
import { Popover as Base } from "@/lib/providers/ui";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof popover> & {
    id?: string;
    invalid?: boolean;
    describedBy?: string;
    label: string;
    title?: string;
    heading?: boolean;
    close?: string;
    trigger: ReactNode;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: ( value: boolean ) => void;
    align?: "start" | "center" | "end";
    side?: "top" | "bottom";
};

const popover = tv({
    slots: {
        trigger: "",
        popup: "popover-popup popup-motion popup-frame flex flex-col overflow-y-auto thin-scrollbar",
    },
    variants: {
        look: {
            button: { trigger: "btn btn-outline btn-md data-popup-open:border-field" },
            pebble: { trigger: "pebble" },
            chip: { trigger: "chip data-popup-open:border-field" },
            field: { trigger: "search-trigger" },
            box: { trigger: "field-shell field-lg w-full picker-box" },
            cell: { trigger: "picker-cell" },
            plain: { trigger: "inline-flex cursor-pointer items-center gap-1.5 rounded-control text-ink" },
            nav: {
                trigger: [
                    "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-transparent px-3.5 text-small",
                    "font-medium text-muted control-motion hover:bg-hover hover:text-ink data-popup-open:bg-hover data-popup-open:text-ink",
                ],
            },
            wide: { trigger: "pebble pebble-wide pebble-round" },
            ghost: { trigger: "btn btn-ghost btn-sm btn-icon btn-pill" },
        },
        width: {
            auto: { popup: "w-auto" },
            small: { popup: "w-72" },
            medium: { popup: "w-96" },
            large: { popup: "w-2xl" },
            calendar: { popup: "w-fit [--popover-round:var(--radius-5xl)]" },
            locale: { popup: "w-90" },
            inbox: { popup: "w-[min(25rem,calc(100vw-1.5rem))]" },
        },
        padding: { none: { popup: "p-0" }, tight: { popup: "p-2" }, normal: { popup: "p-4" }, roomy: { popup: "p-5 sm:p-6" } },
    },
    defaultVariants: { look: "button", width: "medium", padding: "normal" },
});

export default function Popover ({
    id, invalid, describedBy, label, title, heading, close, trigger, children, open, onOpenChange, align = "end", side = "bottom",
    look, width, padding,
}: Props) {

    const styles = popover({ look, width, padding });

    return (

        <Base.Root open={open} onOpenChange={onOpenChange}>

            <Base.Trigger
                id={id} aria-label={label} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={styles.trigger()}
            >

                {trigger}

            </Base.Trigger>

            <Base.Portal>

                <Base.Positioner side={side} align={align} sideOffset={10} collisionPadding={12} className="z-60">

                    <Base.Popup className={styles.popup()}>

                        {heading ? (

                            <div className="-mx-1 mb-3 flex items-center justify-between gap-3 border-b border-line px-1 pb-3">

                                <Base.Title className="text-title font-semibold">{title ?? label}</Base.Title>

                                {close ? (

                                    <Base.Close aria-label={close} className="btn btn-ghost btn-sm btn-icon btn-pill">

                                        <X weight="bold" />

                                    </Base.Close>

                                ) : null}

                            </div>

                        ) : <Base.Title className="sr-only">{title ?? label}</Base.Title>}

                        {children}

                    </Base.Popup>

                </Base.Positioner>

            </Base.Portal>

        </Base.Root>

    );

}
