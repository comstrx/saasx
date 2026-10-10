import type { ComponentProps } from "react";
import Amount from "@/elements/amount";
import Badge from "@/elements/badge";
import Button from "@/elements/button";
import Check from "@/elements/check";
import Emblem from "@/elements/emblem";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";
import type { Money } from "@/lib/std/format";
import BulkBar from "./bulk-bar";

type Row = {
    key: string; title: string; detail: string | null; icon: string; amount?: Money; value?: string | null; credit?: boolean;
    status?: { label: string; tone: "positive" | "attention" | "negative" | "neutral" } | null;
};
type Selection = { ids: readonly number[]; label: ( title: string ) => string; onPick: ( id: number, value: boolean ) => void };
type Props = {
    label: string; items: readonly Row[]; currencyLabel: string; open?: string; onOpen?: ( key: string ) => void;
    selection?: Selection | null;
    bulk?: ComponentProps<typeof BulkBar> | null;
};

const tones = { positive: "success", attention: "warning", negative: "danger", neutral: "neutral" } as const;

function tone ( credit?: boolean ) {

    return credit ? "success" as const : "ink" as const;

}
export default function MoneyList ({ label, items, currencyLabel, open, onOpen, selection, bulk }: Props) {

    return (

        <Surface padding={2} radius="lg">

            {bulk ? <Stack inset="small"><BulkBar {...bulk} /></Stack> : null}

            <Stack as="ul" gap={1} aria-label={label}>

                {items.map(( item ) => (

                    <Surface key={item.key} as="li" tone="clear" border={false} elevation="none" padding={3} radius="md">

                        <Stack direction="row" align="center" gap={4}>

                            {selection ? (

                                <Check
                                    id={`money-select-${item.key}`} label={selection.label(item.title)} labelVisible={false}
                                    checked={selection.ids.includes(Number(item.key))}
                                    onChange={( value ) => selection.onPick(Number(item.key), value)}
                                />

                            ) : null}

                            <Emblem size="small" shape="round" tone={item.credit ? "accent" : "neutral"}>

                                {isIconName(item.icon) ? <Icon name={item.icon} /> : null}

                            </Emblem>

                            <Stack gap={0} grow>

                                <Text size="small" weight="semibold" dir="auto" clamp={1}>{item.title}</Text>

                                {item.detail ? <Text size="label" tone="muted">{item.detail}</Text> : null}

                            </Stack>

                            {item.status ? <Badge tone={tones[item.status.tone]} look="flat">{item.status.label}</Badge> : null}

                            {item.amount ? (

                                <Stack direction="row" align="center" gap={1} fixed>

                                    {item.credit !== undefined ? (

                                        <Text as="span" size="small" weight="bold" tone={tone(item.credit)}>{item.credit ? "+" : "−"}</Text>

                                    ) : null}

                                    <Amount {...item.amount} currencyLabel={currencyLabel} size="small" tone={tone(item.credit)} />

                                </Stack>

                            ) : item.value ? (

                                <Text as="span" size="small" weight="bold" tone={tone(item.credit)} numeric>{item.value}</Text>

                            ) : null}

                            {onOpen && open ? (

                                <Button
                                    variant="ghost" size="small" rounded="full" icon aria-label={`${open}: ${item.title}`}
                                    onClick={() => onOpen(item.key)}
                                >

                                    <Icon name="caret-end" />

                                </Button>

                            ) : null}

                        </Stack>

                    </Surface>

                ))}

            </Stack>

        </Surface>

    );

}
