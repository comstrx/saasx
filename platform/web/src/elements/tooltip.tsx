"use client";

import type { ReactElement } from "react";
import { Tooltip as Base } from "@/lib/providers/ui";

type Props = { label: string; children: ReactElement; side?: "top" | "bottom" };

export default function Tooltip ({ label, children, side = "top" }: Props) {

    return (

        <Base.Root>

            <Base.Trigger delay={350} render={children} />

            <Base.Portal>

                <Base.Positioner side={side} sideOffset={8} className="z-60">

                    <Base.Popup className="tooltip-popup popup-motion">{label}</Base.Popup>

                </Base.Positioner>

            </Base.Portal>

        </Base.Root>

    );

}
