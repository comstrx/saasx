"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useDeferredValue, useMemo, useState, useTransition } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { days } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { calendarNights, type SearchPlace, searchQuery, searchState, searchSuggestion } from "@/lib/std/search";

type Options = { target: string; dates: "stay" | "start" | "none"; guests: boolean; source?: "all" | "places" | "categories" };
type Panel = "dates" | "guests" | null;
export type SheetSection = "where" | "when" | "who";

export function useSearchBar ( { target, dates, guests, source = "all" }: Options ) {

    const t = useTranslations("search");
    const locale = useLocale();
    const router = useRouter();
    const query = useSearchParams();
    const [state, setState] = useState(() => searchState(query));
    const [panel, setPanel] = useState<Panel>(null);
    const [sheet, setSheet] = useState(false);
    const [section, setSection] = useState<SheetSection>("where");
    const [pending, startTransition] = useTransition();
    const term = useDeferredValue(state.query.trim());
    const wanted = term.length >= 2 && state.place?.label !== state.query;
    const everything = useRead("search", "suggest", { query: term, limit: 8 }, { enabled: wanted && source === "all" });
    const places = useRead("geos", "suggest", { query: term, limit: 8 }, { enabled: wanted && source === "places" });
    const groups = useRead("categories", "suggest", { query: term, limit: 8 }, { enabled: wanted && source === "categories" });
    const suggestions = source === "places" ? places : source === "categories" ? groups : everything;
    const options = useMemo(() => (suggestions.data ?? []).flatMap(( row ) => searchSuggestion(row) ?? []), [suggestions.data]);
    const today = useMemo(() => {

        const now = new Date();

        return new Date(now.getFullYear(), now.getMonth(), now.getDate());

    }, []);
    const update = ( values: Partial<typeof state> ) => setState(( previous ) => ({ ...previous, ...values }));
    const nights = calendarNights(state.range);
    const near = useGeolocation(( id ) => choose({ id, label: t("nearby"), detail: null, kind: "near" }));
    const invalid = dates === "stay" && Boolean(state.range.from) && !nights;

    function choose ( place: SearchPlace ) {

        update({ place, query: place.label });
        setSection(dates !== "none" ? "when" : guests ? "who" : "where");

    }
    function submit ( event: FormEvent<HTMLFormElement> ) {

        event.preventDefault();
        go();

    }
    function go () {

        if ( invalid ) {

            setPanel("dates");
            return;

        }

        const params = searchQuery(state, dates, guests);
        const href = localePath(locale, target, routing);

        setPanel(null);
        setSheet(false);
        startTransition(() => router.push(`${href}${params.size ? `?${params}` : ""}` as Route));

    }

    return {
        ...state,
        locale,
        today,
        panel,
        setPanel,
        sheet,
        section,
        setSection,
        setSheet: ( next: boolean ) => { setSheet(next); if ( next ) setSection("where"); },
        pending,
        update,
        submit,
        go,
        clear: () => setState(( previous ) => ({ ...previous, query: "", place: null, range: {}, adults: 2, children: 0 })),
        invalid,
        options: wanted && state.query.trim() === term && !suggestions.loading ? options : [],
        busy: wanted && (suggestions.loading || state.query.trim() !== term),
        failed: wanted && Boolean(suggestions.error),
        setQuery: ( query: string ) => update({ query, place: null }),
        select: ( place: SearchPlace | null ) => update({ place, ...(place ? { query: place.label } : {}) }),
        pick: choose,
        near,
        dates: state.range.from ? days(state.range.from, state.range.to ?? state.range.from, locale) : null,
        people: t("guests", { count: state.adults + state.children }),
        nights: dates === "stay" && nights ? t("nights", { count: nights }) : null,
    };

}
