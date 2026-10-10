"use client";

import { useMemo } from "react";
import type { Data } from "@/api/features";
import { useBookingSlots } from "@/hooks/use-booking-slots";
import { useFormFields } from "@/hooks/use-form-fields";
import { useTimeZone, useTranslations } from "@/lib/providers/intl";
import { applicantRows } from "@/lib/std/applicants";
import { cartValues } from "@/lib/std/cart";
import { bookingErrors, bookingInput, bookingRules, namesApplicants } from "@/lib/std/checkout";
import { calendarToday, dateValue } from "@/lib/std/search";

type Product = Data<"products", "order">["product"];
type Line = Data<"cart", "view">;

export function useCartFields ( product: Product, item: Line ) {

    const t = useTranslations("checkout");
    const timeZone = useTimeZone();
    const today = dateValue(calendarToday(timeZone ?? "UTC"));
    const rules = useMemo(() => bookingRules(product), [product]);
    const form = useFormFields({
        initial: cartValues(item, rules),
        validate: ( values ) => Object.fromEntries(Object.entries(bookingErrors(values, rules, today))
            .map(( [key, value] ) => [key, t(value)])),
    });
    const enabled = namesApplicants(form.values, rules);
    const slots = useBookingSlots({
        productId: product.id, date: form.values.starts_at, quantity: Number(form.values.quantity),
        value: form.values.slot, enabled: !!rules.scheduled,
    });
    const tiers = [...new Set([
        ...(product.prices ?? []).flatMap(( row ) => row.tier ? [row.tier] : []),
        ...(item.tier ? [item.tier] : []),
    ])];

    function input () {

        if ( !form.check(slots.fault ? { slot: slots.fault } : {}) ) return null;

        const held = bookingInput(form.values, rules);

        return {
            cartId: item.id, quantity: held.quantity,
            starts_at: rules.scheduled ? slots.selected?.starts_at ?? null : held.starts_at ?? null,
            ends_at: held.ends_at ?? null,
            adults: held.adults ?? null, children: held.children ?? null, infants: held.infants ?? null,
            applicants: held.applicants ?? null, tier: held.tier ?? null,
        };

    }

    return { form, rules, today, tiers, slots, input, enabled, applicants: applicantRows(form.values, enabled) };

}
