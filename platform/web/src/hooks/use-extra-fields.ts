"use client";

import { useEffect } from "react";
import type { ExtraSlot } from "@/hooks/use-booking-extras";
import { useBookingSlots } from "@/hooks/use-booking-slots";
import type { extraState } from "@/lib/std/extras";

type State = ReturnType<typeof extraState>;

export function useExtraFields ( productId: number, state: State, report: ( id: number, state: ExtraSlot ) => void ) {

    const slots = useBookingSlots({ productId, date: state.values.starts_at, quantity: Number(state.values.quantity),
        value: state.values.slot, enabled: !!state.rules.scheduled,
    });

    useEffect(() => {

        if ( state.rules.scheduled ) report(productId, { stamp: state.stamp, fault: slots.fault });

    }, [productId, state.rules.scheduled, state.stamp, slots.fault, report]);

    return slots;

}
