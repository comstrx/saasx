"use client";

import type { Data } from "@/api/features";
import type cart from "@/api/features/cart";
import Button from "@/elements/button";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import { useCartFields } from "@/hooks/use-cart-fields";
import { useTranslations } from "@/lib/providers/intl";
import type { z } from "@/lib/providers/schema";
import ApplicantList from "./applicant-list";
import BookingFields from "./booking-fields";
import SlotPicker from "./slot-picker";

type Props = {
    item: Data<"cart", "view">; product: Data<"products", "order">["product"]; disabled?: boolean;
    onSave: ( input: z.input<typeof cart.update.input> ) => void;
};

export default function CartFields ({ item, product, disabled, onSave }: Props) {

    const fields = useCartFields(product, item);
    const { form } = fields;
    const t = useTranslations("cart");

    return (

        <Form noValidate onSubmit={( event ) => {

            event.preventDefault();

            const input = fields.input();

            if ( input && !disabled ) onSave(input);

        }}>

            <Stack gap={5}>

                <BookingFields
                    values={form.values} rules={fields.rules} errors={form.errors} tiers={fields.tiers}
                    today={fields.today} disabled={disabled} id={form.id} onChange={form.change}
                />
                {fields.rules.scheduled ? <SlotPicker
                    {...fields.slots} id={form.id("slot")} value={form.values.slot} error={form.errors.slot}
                    disabled={disabled} onChange={( value ) => form.change({ slot: value })}
                /> : null}
                {fields.rules.named ? <ApplicantList
                    rows={fields.applicants} enabled={fields.enabled} required={!!fields.rules.namedRequired}
                    today={fields.today} errors={form.errors} id={form.id} onChange={form.change} disabled={disabled}
                /> : null}
                <Button type="submit" disabled={disabled}>{t("saveChanges")}</Button>

            </Stack>

        </Form>

    );

}
