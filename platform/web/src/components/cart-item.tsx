"use client";

import type { ReactNode } from "react";
import Amount from "@/elements/amount";
import Button from "@/elements/button";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Media from "@/elements/media";
import Record from "@/elements/record";
import Stack from "@/elements/stack";
import Stepper from "@/elements/stepper";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import type { Money } from "@/lib/std/format";

type Props = {
    name: string; href?: string | null; image?: string | null; description?: string; detail?: string;
    amount?: Money; currencyLabel: string; priceLabel: string; unavailable: string;
    quantity: number; minimum: number; maximum: number; disabled?: boolean;
    labels: { quantity: string; decrease: string; increase: string; remove: string; edit: string };
    purchase?: { href: string; label: string };
    onQuantity?: ( value: number ) => void; onRemove?: () => void; onEdit?: () => void; selection?: ReactNode;
};

export default function CartItem ( props: Props ) {

    return (

        <Record media={<Media src={props.image ?? null} alt="" ratio="square" />}
            details={<Stack gap={1}>

                <Text size="small" tone="muted">{props.priceLabel}</Text>
                {props.amount ? <Amount {...props.amount} currencyLabel={props.currencyLabel} size="title" />
                    : <Text size="small" tone="muted">{props.unavailable}</Text>}

            </Stack>}
            action={<>

                {props.purchase ? props.disabled ? <Button size="small" disabled>{props.purchase.label}</Button> : <Link
                    href={props.purchase.href} variant="filled" size="small"
                >{props.purchase.label}</Link> : null}
                {props.onEdit ? <Button variant="outlined" size="small" disabled={props.disabled} onClick={props.onEdit}>
                    <Icon name="edit" />{props.labels.edit}
                </Button> : null}
                {props.onRemove ? <Button variant="ghost" size="small" disabled={props.disabled} onClick={props.onRemove}>
                    <Icon name="trash" />{props.labels.remove}
                </Button> : null}

            </>}
        >

            <Stack direction="row" gap={3} align="start">

                {props.selection}
                <Heading level={2} size="title" clamp={2}>
                    {props.href ? <Link href={props.href} variant="heading" dir="auto">{props.name}</Link> : props.name}
                </Heading>

            </Stack>
            {props.description ? <Text size="small" tone="muted">{props.description}</Text> : null}
            {props.detail ? <Text size="small" tone="muted">{props.detail}</Text> : null}
            {props.onQuantity ? <Stack direction="row">

                <Stepper
                    label={props.labels.quantity} value={props.quantity} minimum={props.minimum} maximum={props.maximum}
                    disabled={props.disabled} onChange={props.onQuantity} size="small"
                    decrease={props.labels.decrease}
                    increase={props.labels.increase}
                />

            </Stack> : <Text size="small" tone="muted">{props.labels.quantity}: {props.quantity}</Text>}

        </Record>

    );

}
