"use client";

import Button from "@/elements/button";
import Calendar from "@/elements/calendar";
import Divider from "@/elements/divider";
import Pair from "@/elements/pair";
import Popover from "@/elements/popover";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useMediaQuery } from "@/hooks/use-effects";
import type { DateRange } from "@/lib/std/search";

type Props = {
    id?: string;
    invalid?: boolean;
    describedBy?: string;
    locale: "ar" | "en";
    label: string;
    summary: string;
    empty?: boolean;
    clear: string;
    done: string;
    hint?: string | null;
    value: DateRange;
    minimum: Date;
    mode?: "range" | "single";
    open: boolean;
    look?: "field" | "box" | "cell";
    split?: { start: { label: string; value: string | null }; end: { label: string; value: string | null } } | null;
    onOpenChange: ( open: boolean ) => void;
    onChange: ( range: DateRange ) => void;
};

function Moment ({ label, value, empty }: { label: string; value: string | null; empty: string }) {

    return (

        <>

            <Text as="span" size="micro" tone="muted">{label}</Text>

            <Text as="span" size="small" tone={value ? "ink" : "placeholder"} weight="semibold" truncate>{value ?? empty}</Text>

        </>

    );

}
export default function DatePicker ({
    id, invalid, describedBy, locale, label, summary, empty, clear, done, hint, value, minimum, mode, open, look = "field", split,
    onOpenChange, onChange,
}: Props) {

    const wide = useMediaQuery("(min-width: 48rem)");

    return (

        <Popover
            id={id}
            invalid={invalid}
            describedBy={describedBy}
            label={`${label}: ${summary}`}
            title={label}
            open={open}
            onOpenChange={onOpenChange}
            align="center"
            width="calendar"
            look={look}
            padding="roomy"
            trigger={split ? (

                <Pair start={<Moment {...split.start} empty={summary} />} end={<Moment {...split.end} empty={summary} />} />

            ) : (

                <Stack gap={0}>

                    <Text as="span" size="label" weight="semibold">{label}</Text>

                    <Text as="span" size="value" tone={empty ? "placeholder" : "ink"} weight={empty ? "normal" : "semibold"} truncate>

                        {summary}

                    </Text>

                </Stack>

            )}
        >

            <Stack gap={5}>

                <Calendar locale={locale} value={value} minimum={minimum} mode={mode} months={wide ? 2 : 1} onChange={onChange} />

                <Divider />

                <Stack direction="row" align="center" justify="between" gap={3}>

                    <Text size="small" tone="muted" role="status">{hint}</Text>

                    <Stack direction="row" align="center" gap={4}>

                        <Button variant="link" onClick={() => onChange({})}>{clear}</Button>

                        <Button onClick={() => onOpenChange(false)}>{done}</Button>

                    </Stack>

                </Stack>

            </Stack>

        </Popover>

    );

}
