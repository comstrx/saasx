"use client";

import type { ComponentProps, ReactNode } from "react";
import Button from "@/elements/button";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import type { CouponScope } from "@/hooks/use-coupon-check";
import { useTranslations } from "@/lib/providers/intl";
import BookingFields from "./booking-fields";
import CouponField from "./coupon-field";
import FormFeedback from "./form-feedback";
import FormSection from "./form-section";
import PaymentChoices from "./payment-choices";

type Props = {
    fields: ComponentProps<typeof BookingFields>; payment: ComponentProps<typeof PaymentChoices>; paymentHint?: string;
    pending: boolean; reviewed?: boolean; disabled?: boolean; error?: string | null; coupon: CouponScope;
    onSubmit: () => void; children?: ReactNode; additional?: ReactNode;
};

export default function ReservationForm ({
    fields, payment, paymentHint, pending, reviewed, disabled, error, coupon, onSubmit, children, additional,
}: Props) {

    const t = useTranslations("checkout");

    return (

        <Form pending={pending} noValidate onSubmit={( event ) => { event.preventDefault(); onSubmit(); }}>

            <FormSection title={t("detailsTitle")}>

                <BookingFields {...fields} disabled={pending || disabled} />
                {additional}

            </FormSection>

            {children}

            <FormSection title={t("paymentMethod")} description={paymentHint ?? t("reviewHint")}>

                <PaymentChoices {...payment} disabled={pending || disabled} />

                <CouponField
                    id={fields.id("coupon_code")} label={t("couponLabel")} value={fields.values.coupon_code} scope={coupon}
                    error={fields.errors.coupon_code} disabled={pending || disabled}
                    onChange={( value ) => fields.onChange({ coupon_code: value })}
                />

                <FormFeedback id={fields.id("failure")} error={error} />

                <Stack gap={2}>

                    <Button
                        type="submit" width="full" size="large" variant={reviewed ? "outlined" : "filled"}
                        pending={pending} disabled={disabled}
                    >

                        {t(pending ? "reviewing" : reviewed ? "refreshPrice" : "reviewPrice")}

                    </Button>
                    <Text size="small" tone="muted" align="center">{t("noChargeReview")}</Text>

                </Stack>

            </FormSection>

        </Form>

    );

}
