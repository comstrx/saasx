"use client";

import Button from "@/elements/button";
import Popover from "@/elements/popover";
import Stack from "@/elements/stack";
import Stepper from "@/elements/stepper";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Guest = {
    value: number;
    label: string;
    hint?: string;
    less: string;
    more: string;
    onChange: ( value: number ) => void;
};
type Props = {
    label: string;
    summary: string;
    done: string;
    adults: Guest;
    kids: Guest;
    open: boolean;
    look?: "field" | "box" | "cell";
    onOpenChange: ( open: boolean ) => void;
};

export default function GuestPicker ({ label, summary, done, adults, kids, open, look = "field", onOpenChange }: Props) {

    const cell = look === "cell";

    return (

        <Popover
            label={`${label}: ${summary}`}
            title={label}
            open={open}
            onOpenChange={onOpenChange}
            look={look}
            width="small"
            padding="roomy"
            trigger={

                <Stack direction="row" align="center" justify="between" gap={3}>

                    <Stack gap={0}>

                        <Text as="span" size={cell ? "micro" : "label"} tone={cell ? "muted" : "ink"} weight={cell ? "normal" : "semibold"}>

                            {label}

                        </Text>

                        <Text as="span" size={cell ? "small" : "value"} weight="semibold" truncate>{summary}</Text>

                    </Stack>

                    {cell ? <Icon name="caret-down" size="sm" weight="bold" /> : null}

                </Stack>

            }
        >

            <Stack gap={5}>

                {[adults, kids].map(( guest, index ) => (

                    <Stepper
                        key={guest.label}
                        label={guest.label}
                        hint={guest.hint}
                        value={guest.value}
                        minimum={index === 0 ? 1 : 0}
                        maximum={30}
                        decrease={guest.less}
                        increase={guest.more}
                        onChange={guest.onChange}
                    />

                ))}

                <Button width="full" onClick={() => onOpenChange(false)}>{done}</Button>

            </Stack>

        </Popover>

    );

}
