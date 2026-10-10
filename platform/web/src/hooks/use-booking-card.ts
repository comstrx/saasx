"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Entity } from "@/api/features";
import { useStayQuote } from "@/hooks/use-stay-quote";
import { useLocale, useTimeZone, useTranslations } from "@/lib/providers/intl";
import { bookingPerks, nextDate } from "@/lib/std/availability";
import { day, days, money } from "@/lib/std/format";
import { calendarDate, calendarNights, calendarToday, type DateRange, dateValue, searchState } from "@/lib/std/search";

type Product = Entity<"product">;
type Room = {
    id: number; name: string; soldOut: boolean;
    adults?: number | null; children?: number | null; price: Product["min_price"];
};
export type BookingOptions = {
    productId: number;
    checkout: string | null;
    rooms: readonly Room[];
    stay: boolean;
    dated: boolean;
    starts: string | null;
    closed: boolean;
    currency: string;
    adults?: number | null;
    children?: number | null;
    minimum: number;
    maximum: number | null;
    minStay: number;
    maxStay: number | null;
    initial: string;
    lead?: number | null;
    rating?: { value: string; count: string; label: string } | null;
    freeHours?: number | null;
    payLater?: boolean;
    cart?: string | null;
};

export function useBookingCard ( options: BookingOptions, fieldId: string ) {

    const locale = useLocale() as "ar" | "en";
    const t = useTranslations("booking");
    const router = useRouter();
    const search = useTranslations("search");
    const query = useMemo(() => new URLSearchParams(options.initial), [options.initial]);
    const initial = useMemo(() => searchState(query), [query]);
    const timeZone = useTimeZone();
    const today = useMemo(() => calendarToday(timeZone ?? "UTC"), [timeZone]);
    const requested = Number(query.get("room"));
    const [roomId, setRoomId] = useState(String(options.rooms.find(( room ) => room.id === (requested || options.lead))?.id ?? ""));
    const [range, setRange] = useState<DateRange>(options.starts
        ? { from: calendarDate(options.starts.slice(0, 10)) } : initial.range);
    const [adults, setAdults] = useState(initial.adults);
    const [children, setChildren] = useState(initial.children);
    const requestedQuantity = Number(query.get("quantity"));
    const [quantity, setQuantity] = useState(Number.isSafeInteger(requestedQuantity)
        && requestedQuantity >= options.minimum && requestedQuantity <= (options.maximum ?? 1000) ? requestedQuantity : options.minimum);
    const [panel, setPanel] = useState<"dates" | "guests" | null>(null);
    const [checked, setChecked] = useState("");
    const [attempted, setAttempted] = useState(false);
    const room = options.rooms.find(( row ) => String(row.id) === roomId);
    const from = range.from ? dateValue(range.from) : "";
    const to = options.stay ? (range.to ? dateValue(range.to) : "") : from ? nextDate(from) : "";
    const nights = calendarNights(range);
    const capacity = room ?? options;
    const mismatch = options.stay && (
        Boolean(capacity.adults && adults > capacity.adults) || Boolean(capacity.children && children > capacity.children)
    );
    const error = options.closed ? t("closed")
        : options.rooms.length && !room ? t("chooseOption")
        : room?.soldOut ? t("closed")
        : mismatch ? t("partyMismatch")
        : options.dated && (!from || !to) ? t("chooseDates")
        : options.dated && range.from && range.from < today ? t("pastDates")
        : options.stay && (nights < options.minStay || (options.maxStay != null && nights > options.maxStay)) ? t("stayLength", {
            min: options.minStay, max: options.maxStay ?? 0,
        }) : null;
    const input = { productId: room?.id ?? options.productId, from, to, quantity };
    const priced = Boolean(from && to) && !error;
    const quote = useStayQuote(input, options.currency, options.stay && priced);
    const signature = `${JSON.stringify(input)}:${adults}:${children}`;
    const roomPrice = room ? money(room.price, locale, options.currency) : undefined;

    function check ( proceed = false ) {

        setAttempted(true);

        if ( error ) {

            if ( options.rooms.length && !room || mismatch ) document.getElementById(fieldId)?.focus();
            else if ( !from || !to ) setPanel("dates");

            return;

        }

        const params = new URLSearchParams(window.location.search);

        if ( from ) params.set("from", from);
        if ( options.stay && to ) params.set("to", to);
        if ( room ) params.set("room", String(room.id));

        if ( options.stay ) {

            params.set("adults", String(adults));
            params.set("children", String(children));

        }

        params.set("quantity", String(quantity));
        window.history.replaceState(null, "", `${window.location.pathname}?${params}#booking`);
        setChecked(signature);

        if ( proceed && options.checkout ) {

            params.delete("room");
            router.push(`${options.checkout.replace(":productId", String(input.productId))}?${params}` as Route);

        }

    }

    const short = { weekday: "short", day: "numeric", month: "short" } as const;
    const perks = bookingPerks({ from: range.from, today, hours: options.freeHours, payLater: options.payLater, locale }, t);

    return {
        perks,
        split: options.stay ? {
            start: { label: t("checkIn"), value: range.from ? day(range.from, locale, short) : null },
            end: { label: t("checkOut"), value: range.to ? day(range.to, locale, short) : null },
        } : null,
        nights,
        locale, t, search, today, range, setRange, adults, setAdults, children, setChildren, quantity, setQuantity,
        panel, setPanel, roomId, setRoomId, roomPrice, check: () => check(), proceed: () => check(true), input,
        checked: checked === signature && !error,
        signature,
        priced,
        quote,
        reserve: () => {

            if ( error ) document.getElementById("booking")?.scrollIntoView({ block: "center" });

            check(true);

        },
        error: attempted || options.closed ? error : null,
        dates: range.from ? days(range.from, range.to ?? range.from, locale) : search("addDates"),
        people: search("guests", { count: adults + children }),
        rooms: [{ value: "", label: t("chooseOption") }, ...options.rooms.map(( row ) => ({
            value: String(row.id), label: row.name,
        }))],
    };

}
