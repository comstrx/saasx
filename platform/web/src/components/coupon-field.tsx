"use client";

import Button from "@/elements/button";
import Field from "@/elements/field";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { type CouponScope, useCouponCheck } from "@/hooks/use-coupon-check";
import Icon from "@/icons/icon";

type Props = {
    id: string; label: string; value: string; error?: string; disabled?: boolean; scope: CouponScope;
    onChange: ( value: string ) => void;
};

export default function CouponField ({ id, label, value, error, disabled, scope, onChange }: Props) {

    const coupon = useCouponCheck(scope);

    return (

        <Stack gap={2}>

            <Stack direction="row" align="end" gap={2}>

                <Stack grow>

                    <Field
                        id={id} label={label} value={value} error={error ?? coupon.error ?? undefined} disabled={disabled} maxLength={100}
                        autoComplete="off" dir="ltr" onChange={( event ) => { coupon.reset(); onChange(event.target.value); }}
                    />

                </Stack>

                <Button
                    variant="outlined"
                    pending={coupon.pending}
                    disabled={disabled || !value.trim()}
                    onClick={() => { void coupon.check(value); }}
                >

                    {coupon.apply}

                </Button>

            </Stack>

            {coupon.message ? (

                <Stack direction="row" align="center" gap={2} role="status">

                    <Icon name="check-circle" size="sm" weight="fill" tone="success" />

                    <Text size="small" tone="success">{coupon.message}</Text>

                </Stack>

            ) : null}

        </Stack>

    );

}
