"use client";

import { type ReactNode, type RefObject, useRef } from "react";
import { X } from "@/lib/providers/icons";
import { Dialog as Base } from "@/lib/providers/ui";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof dialog> & {
    open: boolean;
    onOpenChange: ( value: boolean ) => void;
    title: string;
    description?: string;
    close: string;
    finalFocus?: RefObject<HTMLElement | null>;
    initialFocus?: RefObject<HTMLElement | null>;
    footer?: ReactNode;
    children: ReactNode;
    wide?: boolean;
    dismissible?: boolean;
    trigger?: ReactNode;
    triggerLabel?: string;
    hero?: ReactNode;
};

const dialog = tv({
    base: "dialog-frame",
    variants: { size: { small: "", medium: "dialog-medium", large: "dialog-wide" } },
    defaultVariants: { size: "small" },
});

function Hero ({ close, dismissible, art, title, description, anchor }: {
    close: string; dismissible: boolean; art: ReactNode; title: string; description?: string; anchor: RefObject<HTMLDivElement | null>;
}) {

    return (

        <div ref={anchor} tabIndex={-1} className="dialog-hero">

            <span className="dialog-hero-close">

                <Base.Close aria-label={close} disabled={!dismissible} className="btn btn-ghost btn-sm btn-icon btn-pill">

                    <X weight="bold" />

                </Base.Close>

            </span>

            {art}

            <Base.Title className="text-h2 font-semibold text-balance">{title}</Base.Title>

            {description ? <Base.Description className="text-value text-pretty text-muted">{description}</Base.Description> : null}

        </div>

    );

}
export default function Dialog ({
    open, onOpenChange, title, description, close, finalFocus, initialFocus, footer, children, wide, dismissible = true, size, trigger,
    triggerLabel, hero,
}: Props) {

    const anchor = useRef<HTMLDivElement>(null);

    return (

        <Base.Root open={open} onOpenChange={onOpenChange}>

            {trigger ? (

                <Base.Trigger aria-label={triggerLabel} className="chip data-popup-open:border-field">{trigger}</Base.Trigger>

            ) : null}

            <Base.Portal>

                <Base.Backdrop className="dialog-backdrop" />

                <Base.Popup
                    className={dialog({ size: wide ? "large" : size })}
                    initialFocus={initialFocus ?? (hero ? anchor : undefined)}
                    finalFocus={finalFocus}
                >

                    {hero ? (

                        <Hero close={close} dismissible={dismissible} art={hero} title={title} description={description} anchor={anchor} />

                    ) : (

                        <div className="dialog-head">

                            <Base.Close aria-label={close} disabled={!dismissible} className="btn btn-ghost btn-sm btn-icon btn-pill">

                                <X weight="bold" />

                            </Base.Close>

                            <div className="flex min-w-0 flex-col items-center gap-1 text-center">

                                <Base.Title className="text-title font-semibold">{title}</Base.Title>

                                {description ? <Base.Description className="text-small text-muted">{description}</Base.Description> : null}

                            </div>

                        </div>

                    )}

                    <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 thin-scrollbar sm:px-6">{children}</div>

                    {footer ? (

                        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-6">

                            {footer}

                        </div>

                    ) : null}

                </Base.Popup>

            </Base.Portal>

        </Base.Root>

    );

}
