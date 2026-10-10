"use client";

import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { bookingSlots, nextDate, slotTime } from "@/lib/std/availability";
import { calendarDate } from "@/lib/std/search";

type Input = { productId: number; date: string; quantity: number; value: string; enabled: boolean };

export function useBookingSlots ( { productId, date, quantity, value, enabled }: Input ) {

    const t = useTranslations("checkout");
    const locale = useLocale();
    const active = enabled && !!calendarDate(date) && Number.isInteger(quantity) && quantity > 0;
    const request = useRead("products", "availability", { productId, from: date, to: nextDate(date) }, { enabled: active });
    const data = bookingSlots(request.data, date, quantity);
    const selected = data.options.find(( option ) => option.starts_at === value && option.available);
    const fault = !active ? null : request.loading ? t("slotsLoading")
        : request.error ? t("slotsFailed") : !data.known ? t("slotsUnknown") : !data.open ? t("slotsEmpty")
        : data.slotted && !selected ? t("chooseSlot") : null;

    return {
        loading: request.loading, failed: !!request.error, reload: request.reload, active, fault,
        slotted: data.slotted, known: data.known, open: data.open, selected,
        options: data.options.map(( option ) => ({
            value: option.starts_at, disabled: !option.available,
            label: t(option.available ? "slotRange" : "slotUnavailable", {
                from: slotTime(option.starts_at, locale), to: slotTime(option.ends_at, locale),
            }),
        })),
    };

}
