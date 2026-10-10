import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof busy> & { busy: boolean; label: string; children: ReactNode };

const busy = tv({
    slots: {
        frame: "busy-frame",
        veil: "busy-veil",
        disc: "busy-disc",
        ring: "spinner",
    },
    variants: {
        place: {
            center: {},
            start: { veil: "[--busy-place:start_end] items-start" },
            top: { veil: "[--busy-place:start_center] items-start pt-10" },
        },
        size: {
            small: { disc: "[--busy-disc:2.25rem]", ring: "spinner-sm" },
            medium: {},
            large: { disc: "[--busy-disc:3.5rem]", ring: "spinner-lg" },
        },
        fill: { true: { frame: "h-full" } },
    },
    defaultVariants: { place: "center", size: "medium" },
});

export default function Busy ({ busy: active, label, place, size, fill, children }: Props) {

    const look = busy({ place, size, fill });

    return (

        <div data-busy={active ? "" : undefined} aria-busy={active || undefined} className={look.frame()}>

            <div className="busy-content">{children}</div>

            {active ? (

                <div role="status" className={look.veil()}>

                    <span className={look.disc()}>

                        <svg aria-hidden="true" viewBox="0 0 24 24" className={look.ring()}>

                            <circle cx="12" cy="12" r="10" />

                            <circle cx="12" cy="12" r="10" pathLength="100" />

                        </svg>

                    </span>

                    <span className="sr-only">{label}</span>

                </div>

            ) : null}

        </div>

    );

}
