"use client";

import { Slider as Base } from "@/lib/providers/ui";

type Props = {
    label: string;
    value: readonly [number, number];
    minimum: number;
    maximum: number;
    step?: number;
    disabled?: boolean;
    thumbLabels: readonly [string, string];
    onChange: ( value: [number, number] ) => void;
    onCommit?: ( value: [number, number] ) => void;
};

export default function Slider ({ label, value, minimum, maximum, step = 1, disabled, thumbLabels, onChange, onCommit }: Props) {

    return (

        <Base.Root
            aria-label={label}
            value={[...value]}
            min={minimum}
            max={maximum}
            step={step}
            disabled={disabled}
            onValueChange={( next ) => onChange(next as [number, number])}
            onValueCommitted={( next ) => onCommit?.(next as [number, number])}
            className="w-full"
        >

            <Base.Control className="slider-control">

                <Base.Track className="slider-track">

                    <Base.Indicator className="slider-range" />

                    <Base.Thumb index={0} aria-label={thumbLabels[0]} className="slider-thumb" />

                    <Base.Thumb index={1} aria-label={thumbLabels[1]} className="slider-thumb" />

                </Base.Track>

            </Base.Control>

        </Base.Root>

    );

}
