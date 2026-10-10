"use client";

import type { ReactNode } from "react";
import { X } from "@/lib/providers/icons";
import { Dialog as Base } from "@/lib/providers/ui";

type Props = {
    open: boolean;
    onOpenChange: ( value: boolean ) => void;
    title: string;
    close: string;
    footer?: ReactNode;
    head?: ReactNode;
    full?: boolean;
    children: ReactNode;
};

export default function Sheet ({ open, onOpenChange, title, close, footer, head, full = false, children }: Props) {

    const shut = (

        <Base.Close aria-label={close} className={full ? "pebble pebble-sm shrink-0" : "btn btn-soft btn-sm btn-icon btn-pill"}>

            <X weight="bold" />

        </Base.Close>

    );

    return (

        <Base.Root open={open} onOpenChange={onOpenChange}>

            <Base.Portal>

                <Base.Backdrop className="dialog-backdrop" />

                <Base.Popup className={full ? "sheet-frame sheet-full" : "sheet-frame"}>

                    {full ? (

                        <div className="sheet-full-head">

                            {shut}

                            <Base.Title className="sr-only">{title}</Base.Title>

                            <div className="min-w-0 flex-1">{head}</div>

                        </div>

                    ) : (

                        <>

                            <span aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-strong" />

                            <div className="flex shrink-0 items-center justify-between gap-4 px-5 pt-3 pb-4">

                                <Base.Title className="text-title font-semibold">{title}</Base.Title>

                                {shut}

                            </div>

                        </>

                    )}

                    <div className={full ? "sheet-full-body" : "sheet-body"}>{children}</div>

                    {footer ? <div className={full ? "sheet-full-foot" : "sheet-foot"}>{footer}</div> : null}

                </Base.Popup>

            </Base.Portal>

        </Base.Root>

    );

}
