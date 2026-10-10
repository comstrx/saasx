"use client";

import { useCallback, useState } from "react";
import type { Data } from "@/api/features";
import { useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { extraKey, extraState, selectedExtras } from "@/lib/std/extras";

type Product = Data<"products", "view">;
export type ExtraSlot = { stamp: string; fault: string | null };

export function useBookingExtras ( product: Product, values: Record<string, string>, today: string ) {

    const t = useTranslations("extras");
    const bookingText = useTranslations("checkout");
    const questionText = useTranslations("intake.errors");
    const root = product.parent?.id ?? product.id;
    const parent = useRead("products", "view", { productId: root }, { enabled: root !== product.id });
    const options = (root === product.id ? product.extras : parent.data?.extras) ?? [];
    const selected = selectedExtras(values);
    const requested = selected.filter(( id ) => options.some(( option ) => option.id === id));
    const details = useRead("products", "list", {
        ids: requested, filters: { parent: root }, view: "full", limit: 100,
    }, { enabled: requested.length > 0 });
    const [slots, setSlots] = useState<Record<number, ExtraSlot>>({});
    const reportSlot = useCallback(( id: number, state: ExtraSlot ) => {

        setSlots(( previous ) => previous[id]?.stamp === state.stamp && previous[id]?.fault === state.fault
            ? previous : { ...previous, [id]: state });

    }, []);
    const rows = requested.flatMap(( id ) => {

        const item = details.data?.find(( entry ) => entry.id === id && entry.role === "addon");

        return item ? [{ product: item, ...extraState(item, values, today) }] : [];

    });
    const errors: Record<string, string> = {};

    if ( selected.length && (parent.loading || details.loading) ) errors.addons = t("loading");
    else if ( selected.length && (parent.error || details.error) ) errors.addons = t("failed");
    else if ( rows.length !== selected.length ) errors.addons = t("unavailable");
    for ( const row of rows ) {

        for ( const [key, error] of Object.entries(row.errors) ) {

            errors[extraKey(row.product.id, key)] = bookingText(error);

        }
        for ( const [key, error] of Object.entries(row.questions.errors) ) {

            errors[extraKey(row.product.id, key)] = questionText(error);

        }
        if ( row.rules.scheduled ) {

            const status = slots[row.product.id];
            const fault = status?.stamp === row.stamp ? status.fault : bookingText("slotsLoading");

            if ( fault ) errors[extraKey(row.product.id, "slot")] = fault;

        }

    }

    return { parent, options, selected, details, rows, errors, reportSlot, root };

}
