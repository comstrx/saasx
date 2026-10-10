"use client";

import { useEffect, useMemo, useState } from "react";
import type { Data } from "@/api/features";
import { useBookingExtras } from "@/hooks/use-booking-extras";
import { useBookingSlots } from "@/hooks/use-booking-slots";
import type { useCartMutation } from "@/hooks/use-cart-mutation";
import type { CartDraft } from "@/hooks/use-cart-purchase";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { useTimeZone, useTranslations } from "@/lib/providers/intl";
import { applicantRows } from "@/lib/std/applicants";
import { cartPatch, cartValues } from "@/lib/std/cart";
import { bookingErrors, bookingInput, bookingQuery, bookingRules, bookingValues, namesApplicants } from "@/lib/std/checkout";
import { contactErrors, contactInput } from "@/lib/std/contact";
import { intake } from "@/lib/std/intake";
import { calendarToday, dateValue } from "@/lib/std/search";
import { useUi } from "@/stores/provider";

export type CartPreparation = {
    item: Data<"cart", "view">; mutation: ReturnType<typeof useCartMutation>; editable: boolean;
};

type Product = Data<"products", "order">["product"];
type Purchase = Parameters<ReturnType<typeof useAction<"orders", "preview">>["run"]>[0];
export type Review = { quote: Data<"orders", "preview">; input: Purchase; contact: ReturnType<typeof contactInput>; signature: string };

export function useCheckoutForm ( product: Product, query: string, cart?: CartPreparation, draft?: CartDraft ) {

    const t = useTranslations("checkout");
    const cartText = useTranslations("cart");
    const user = useUi(( state ) => state.user);
    const questionsText = useTranslations("intake.errors");
    const contactText = useTranslations("contact.errors");
    const extraText = useTranslations("extras");
    const timeZone = useTimeZone();
    const today = dateValue(calendarToday(timeZone ?? "UTC"));
    const preview = useAction("orders", "preview");
    const [review, setReview] = useState<Review | null>(null);
    const [preparing, setPreparing] = useState(false);
    const [extraFailure, setExtraFailure] = useState<string | null>(null);
    const [method, setMethod] = useState<string>(draft?.method ?? "wallet");
    const [currency, setCurrency] = useState("");
    const rules = useMemo(() => bookingRules(product), [product]);
    const collect = ( values: ReturnType<typeof bookingValues> ) => intake(product.questions ?? [], values, {
        applicants: applicantRows(values, namesApplicants(values, rules)).length,
        adults: rules.party ? Number(values.adults) : 1,
    });
    const form = useFormFields({
        initial: { ...(cart ? cartValues(cart.item, rules) : bookingValues(query, rules)), ...draft?.values },
        failure: preview.error, clear: preview.clear,
        validate: ( values ) => ({
            ...Object.fromEntries(Object.entries(bookingErrors(values, rules, today)).map(( [key, value] ) => [key, t(value)])),
            ...Object.fromEntries(Object.entries(collect(values).errors).map(( [key, value] ) => [key, questionsText(value)])),
            ...Object.fromEntries(Object.entries(contactErrors(values)).map(( [key, value] ) => [key, contactText(value)])),
        }),
    });
    const applicantsEnabled = namesApplicants(form.values, rules);
    const applicants = applicantRows(form.values, applicantsEnabled);
    const slots = useBookingSlots({
        productId: product.id, date: form.values.starts_at, quantity: Number(form.values.quantity),
        value: form.values.slot, enabled: !!rules.scheduled,
    });
    const extras = useBookingExtras(product, form.values, today);
    const questions = collect(form.values);
    const input: Purchase = {
        productId: product.id, ...bookingInput(form.values, rules),
        ...(cart?.item.pets != null ? { pets: cart.item.pets } : {}),
        ...(extras.selected.length ? { addons: extras.rows.map(( row ) => row.input) } : {}),
        ...(questions.groups.length ? { answers: questions.answers } : {}),
        ...(rules.scheduled ? { starts_at: slots.selected?.starts_at ?? form.values.starts_at } : {}),
        ...(method.startsWith("gateway:") ? {
            gateway_id: Number(method.slice(8)), ...(currency ? { payment_currency: currency } : {}),
        } : {}),
    };
    const contact = contactInput(form.values);
    const signature = JSON.stringify({ input, contact });
    const valid = !Object.keys({ ...questions.errors, ...extras.errors, ...contactErrors(form.values) }).length;
    const current = review?.signature === signature && valid ? review : null;
    const tiers = useMemo(() => [...new Set((product.prices ?? []).flatMap(( rate ) => rate.tier ? [rate.tier] : []))], [product.prices]);

    useEffect(() => {

        if ( Object.keys(bookingErrors(form.values, rules, today)).length ) return;

        const params = bookingQuery(window.location.search, form.values, rules);

        if ( params !== new URLSearchParams(window.location.search).toString() ) {

            window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);

        }

    }, [form.values, rules, today]);

    async function quote () {

        const faults = { ...extras.errors, ...(slots.fault ? { slot: slots.fault } : {}) };

        if ( !form.check(faults) || preview.pending || preparing || cart?.mutation.locked ) return;

        setReview(null);
        setExtraFailure(null);
        setPreparing(true);

        try {

            const pricedInput: Purchase = { ...input, ...(input.addons ? { addons: [...input.addons] } : {}) };

            for ( const row of extras.rows ) {

                if ( !row.questions.groups.length ) continue;

                const { catalog_id, ...details } = row.input;
                const checked = await preview.run({ ...details, productId: catalog_id });

                if ( !checked ) {

                    setExtraFailure(extraText("verifyFailed", { name: row.product.name }));
                    return;

                }

                pricedInput.addons = pricedInput.addons?.map(( item ) => item.catalog_id === catalog_id
                    ? { ...item, answers: checked.resource.answers ?? [] } : item);

            }
            if ( cart ) {

                const original = {
                    ...bookingInput(cartValues(cart.item, rules), rules),
                    ...(cart.item.pets != null ? { pets: cart.item.pets } : {}),
                };
                const patch = cartPatch(pricedInput);

                if ( JSON.stringify(cartPatch(original)) !== JSON.stringify(patch) ) {

                    if ( !user?.permissions?.includes("edit_carts") ) {

                        setExtraFailure(cartText("editPermission"));
                        return;

                    }

                    const saved = await cart.mutation.run("update", { cartId: cart.item.id, ...patch });

                    if ( !saved ) return;

                }

            }

            const reply = await preview.run(pricedInput);

            if ( reply ) {

                setReview({ quote: reply.resource, input: pricedInput, contact, signature });
                requestAnimationFrame(() => document.getElementById(form.id("price"))?.focus());

            }

        }
        finally { setPreparing(false); }

    }
    function checkSaved () {

        const faults = {
            ...Object.fromEntries(Object.entries(bookingErrors(form.values, rules, today)).map(( [key, value] ) => [key, t(value)])),
            ...(slots.fault ? { slot: slots.fault } : {}),
        };

        if ( Object.keys(faults).length ) {

            form.check(faults);
            return false;

        }

        return true;

    }
    function reset () {

        setReview(null);
        preview.clear();

    }
    function progress ( placed: boolean ) {

        const reached = placed ? 3 : current ? 1 : 0;

        return (["details", "review", "done"] as const).map(( key, index ) => ({
            key, label: t(`steps.${key}`), state: index < reached ? "done" : index === reached ? "current" : "next",
        } as const));

    }

    return {
        form, rules, today, tiers, current, quote, preview, method, setMethod, currency, setCurrency, input, reset, progress,
        applicants, applicantsEnabled, slots, questions, extras, extraFailure, checkSaved, pending: preview.pending || preparing,
    };

}
