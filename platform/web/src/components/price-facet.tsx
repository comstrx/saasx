"use client";

import Button from "@/elements/button";
import Currency from "@/elements/currency";
import Field from "@/elements/field";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Histogram from "@/elements/histogram";
import Slider from "@/elements/slider";
import Stack from "@/elements/stack";
import { usePriceFacet } from "@/hooks/use-price-facet";

type Props = {
    title: string;
    floor: number;
    ceiling: number;
    from: number;
    to: number;
    step: number;
    bars: readonly { key: string; count: number }[];
    currency: string;
    glyph: boolean;
    labels: { minimum: string; maximum: string; lowest: string; highest: string; apply: string; reset: string };
};

export default function PriceFacet ({ title, floor, ceiling, from, to, step, bars, currency, glyph, labels }: Props) {

    const price = usePriceFacet({ floor, ceiling, from, to, bars, edges: [...bars.map(( bar ) => Number(bar.key)), ceiling] });
    const sign = <Currency code={currency} glyph={glyph} />;

    return (

        <Stack gap={3}>

            <Heading level={3} size="label" tone="muted">{title}</Heading>

            <Stack gap={0}>

                {price.charted ? <Histogram bars={bars} from={price.active[0]} to={price.active[1]} /> : null}

                <Slider
                    label={title}
                    value={price.value}
                    minimum={floor}
                    maximum={ceiling}
                    step={step}
                    thumbLabels={[labels.lowest, labels.highest]}
                    onChange={price.slide}
                />

            </Stack>

            <Grid columns={2} mobileColumns={2} gap={2} as="div">

                <Field
                    id={`${price.id}-min`} size="small" label={labels.minimum} inputMode="decimal" dir="ltr" value={price.draft.min}
                    placeholder={String(floor)} end={sign} onChange={( event ) => price.type("min", event.target.value)}
                />

                <Field
                    id={`${price.id}-max`} size="small" label={labels.maximum} inputMode="decimal" dir="ltr" value={price.draft.max}
                    placeholder={String(ceiling)} end={sign} onChange={( event ) => price.type("max", event.target.value)}
                />

            </Grid>

            {price.dirty || price.narrowed ? (

                <Stack direction="row" align="center" justify={price.narrowed ? "between" : "end"} gap={2}>

                    {price.narrowed ? <Button variant="link" size="small" onClick={price.reset}>{labels.reset}</Button> : null}

                    {price.dirty ? (

                        <Button size="small" rounded="full" pending={price.pending} onClick={price.apply}>{labels.apply}</Button>

                    ) : null}

                </Stack>

            ) : null}

        </Stack>

    );

}
