"use client";

import { useState } from "react";
import type { Data } from "@/api/features";
import { useBookingSlots } from "@/hooks/use-booking-slots";
import { useFormFields } from "@/hooks/use-form-fields";
import type { useOrderMutation } from "@/hooks/use-order-mutation";
import { useTimeZone, useTranslations } from "@/lib/providers/intl";
import { amendmentCountConflict, amendmentInput, amendmentValues } from "@/lib/std/amendments";
import { applicantRows } from "@/lib/std/applicants";
import { type BookingValues, bookingErrors, bookingRules, namesApplicants } from "@/lib/std/checkout";
import { intake } from "@/lib/std/intake";
import { calendarToday, dateValue } from "@/lib/std/search";

type Order = Data<"orders", "view">;
type Product = Data<"products", "order">["product"];
type Mutation = ReturnType<typeof useOrderMutation>;

export function useAmendmentForm ( order: Order, product: Product, mutation: Mutation, onDone: () => void ) {

    const t = useTranslations("amendments");
    const booking = useTranslations("checkout");
    const questionsText = useTranslations("intake.errors");
    const timeZone = useTimeZone();
    const today = dateValue(calendarToday(timeZone ?? "UTC"));
    const [snapshot] = useState(() => ({ order, product }));
    const [unchanged, setUnchanged] = useState(false);
    const base = bookingRules(snapshot.product);
    const rules = {
        ...base, named: base.named || !!snapshot.order.applicants?.length,
        namedRequired: base.namedRequired || !!snapshot.order.applicants?.length,
    };
    const book = snapshot.product.questions ?? [];
    const [initial] = useState(() => amendmentValues(snapshot.order, rules, book));
    const collect = ( values: BookingValues ) => intake(book, values, {
        applicants: applicantRows(values, namesApplicants(values, rules)).length,
        adults: rules.party ? Number(values.adults) : 1,
    });
    const form = useFormFields({
        initial, failure: mutation.error, clear: () => { mutation.clear(); setUnchanged(false); },
        validate: ( values ) => ({
            ...Object.fromEntries(Object.entries(bookingErrors(values, rules, today)).map(( [key, value] ) => [key, booking(value)])),
            ...Object.fromEntries(Object.entries(collect(values).errors).map(( [key, value] ) => [key, questionsText(value)])),
            ...((values.notes?.length ?? 0) > 3000 ? { notes: t("notesLong") } : {}),
        }),
    });
    const held = !!initial.slot && initial.slot === form.values.slot && initial.starts_at === form.values.starts_at;
    const slots = useBookingSlots({
        productId: product.id, date: form.values.starts_at, quantity: Number(form.values.quantity),
        value: form.values.slot, enabled: !!rules.scheduled && !held,
    });
    const questions = collect(form.values);
    const input = amendmentInput(initial, form.values, rules, questions.answers, collect(initial).answers, book, snapshot.order);
    const applicantsEnabled = namesApplicants(form.values, rules);
    const applicants = applicantRows(form.values, applicantsEnabled);
    const changed = Object.keys(input).some(( key ) => key !== "notes");
    const countConflict = amendmentCountConflict(snapshot.order, form.values, rules, book);

    async function submit () {

        if ( mutation.locked || !order.can_amend || countConflict ) return;
        if ( !form.check(slots.fault ? { slot: slots.fault } : {}) ) return;

        if ( !changed ) {

            setUnchanged(true);
            requestAnimationFrame(() => document.getElementById(form.id("failure"))?.focus());
            return;

        }

        const answer = await mutation.run({ orderId: order.id, ...input });

        if ( answer ) onDone();

    }

    return {
        t, form, rules, today, held, slots, questions, applicantsEnabled, applicants, submit, countConflict,
        canRestoreTime: !!initial.slot && !held,
        restoreTime: () => form.change({ starts_at: initial.starts_at, slot: initial.slot }),
        error: countConflict ? t("countConflict") : unchanged ? t("unchanged") : mutation.error
            ? Object.values(mutation.error.errors).flat()[0] || t("failed") : null,
    };

}
