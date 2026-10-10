"use client";

import { useCallback } from "react";
import type { Data } from "@/api/features";
import { useApi } from "@/hooks/use-api";
import { useRequest } from "@/hooks/use-request";
import { availabilityDays, availabilityState, availabilityWindows } from "@/lib/std/availability";

export type AvailabilityInput = { productId: number; from: string; to: string; quantity: number };

export function useAvailability ( { productId, from, to, quantity }: AvailabilityInput, enabled = true ) {

    const api = useApi();
    const load = useCallback(async ( signal: AbortSignal ) => {

        const days: Data<"products", "availability">["days"] = [];
        let last: Awaited<ReturnType<typeof api.products.availability>> | undefined;

        for ( const window of availabilityWindows(from, to) ) {

            const result = await api.products.availability({ productId, ...window }, { signal });

            days.push(...result.resource.days);
            last = result;

        }

        if ( !last ) throw new RangeError("Invalid availability window");

        return { ...last, resource: { ...last.resource, days } };

    }, [api, productId, from, to]);
    const result = useRequest(load, enabled);
    const dayState = availabilityState(result.data?.days ?? [], availabilityDays(from, to), quantity);
    const slotsOpen = !result.data?.slotted || result.data.days.every(( day ) => day.slots?.some(( slot ) =>
        slot.open && (slot.units == null || slot.units >= quantity)));
    const state: "loading" | "failed" | "unknown" | "available" | "unavailable" = result.loading ? "loading" : result.error ? "failed"
        : dayState === "available" && !slotsOpen ? "unavailable" : dayState;

    return { ...result, state };

}
