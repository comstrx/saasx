import { useCallback, useMemo, useState } from "react";
import { useDebounced } from "@/elements/hooks/use-debounced";
import {
    activeFilterCount,
    initialSearchFilters,
    initialSearchQuery,
    type SearchBounds,
    type SearchFilters,
    type SearchHint,
    type SearchParty,
    type SearchQuery,
    type SearchSort,
} from "@/model/search";
import { useFavoriteToggle } from "@/query/favorites";
import { useSuggest } from "@/query/search";
import { type DateSpan, selectDateSpan } from "@/std/date-range";

type SearchPanel = "sort" | "filters" | "dates" | "party" | null;

export function useSearchController ( onDenied?: () => void, seed?: SearchQuery ) {

    const [ query, setQuery ] = useState<SearchQuery>(() => seed ?? initialSearchQuery());
    const [ draft, setDraft ] = useState<SearchFilters>(query.filters);
    const [ span, setSpan ] = useState<DateSpan>({ start: null, end: null });
    const [ crowd, setCrowd ] = useState<SearchParty>({ adults: query.adults, children: query.children, rooms: query.rooms });
    const [ panel, setPanel ] = useState<SearchPanel>(null);
    const [ mapOpen, setMapOpen ] = useState(false);
    const [ activePin, setActivePin ] = useState<number | null>(null);
    const [ hinting, setHinting ] = useState(false);

    const { favoriteOf, toggle: toggleFavorite } = useFavoriteToggle(onDenied);

    const term = useDebounced(query.term, 260);

    const request = useMemo<SearchQuery>(() => ({ ...query, term }), [ query, term ]);

    const setTerm = useCallback(( value: string ) => {
        setHinting(value.trim().length > 1);
        setQuery(( current ) => ({ ...current, term: value }) );
    }, []);

    const suggestions = useSuggest(hinting ? term : "");

    const submit = useCallback(() => setHinting(false), []);

    const hints = hinting ? suggestions.data ?? [] : [];

    const applyHint = useCallback(( hint: SearchHint ) => {

        setHinting(false);

        if ( hint.kind === "geo" ) {

            setQuery(( current ) => ({
                ...current,
                term: "",
                destination: hint.label,
                bounds: null,
                filters: { ...current.filters, geo: hint.id, category: null },
            }));

            return;

        }

        if ( hint.kind === "category" ) {

            setQuery(( current ) => ({
                ...current,
                term: "",
                destination: hint.label,
                filters: { ...current.filters, category: hint.id },
            }));

            return;

        }

        setQuery(( current ) => ({ ...current, term: hint.label }) );

    }, []);

    const clearPlace = useCallback(() => {

        setQuery(( current ) => ({
            ...current,
            destination: "",
            filters: { ...current.filters, geo: null, category: null },
        }));

    }, []);

    const openSort = useCallback(() => setPanel("sort"), []);

    const openFilters = useCallback(() => {
        setDraft(query.filters);
        setPanel("filters");
    }, [ query.filters ]);

    const closePanel = useCallback(() => setPanel(null), []);

    const selectSort = useCallback(( sort: SearchSort ) => {
        setQuery(( current ) => ({ ...current, sort }) );
        setPanel(null);
    }, []);

    const applyFilters = useCallback(() => {
        setQuery(( current ) => ({ ...current, filters: draft }) );
        setPanel(null);
    }, [ draft ]);

    const resetDraft = useCallback(() => setDraft(initialSearchFilters()), []);

    const showMap = useCallback(() => setMapOpen(true), []);
    const hideMap = useCallback(() => setMapOpen(false), []);

    const searchArea = useCallback(( bounds: SearchBounds ) => {
        setQuery(( current ) => ({ ...current, bounds }) );
    }, []);

    const clearArea = useCallback(() => {
        setQuery(( current ) => ({ ...current, bounds: null }) );
    }, []);

    const pickType = useCallback(( type: string | null ) => {
        const filters = { ...query.filters, types: type ? [ type ] : [] };
        setQuery(( current ) => ({ ...current, filters }) );
        setDraft(filters);
    }, [ query.filters ]);

    const openDates = useCallback(() => {
        setSpan({ start: query.checkin || null, end: query.checkout || null });
        setPanel("dates");
    }, [ query.checkin, query.checkout ]);

    const pickDay = useCallback(( iso: string ) => setSpan(( current ) => selectDateSpan(current, iso) ), []);

    const saveDates = useCallback(() => {
        setQuery(( current ) => ({ ...current, checkin: span.start ?? "", checkout: span.end ?? "" }) );
        setPanel(null);
    }, [ span ]);

    const clearDates = useCallback(() => {
        setSpan({ start: null, end: null });
        setQuery(( current ) => ({ ...current, checkin: "", checkout: "" }) );
        setPanel(null);
    }, []);

    const openParty = useCallback(() => {
        setCrowd({ adults: query.adults, children: query.children, rooms: query.rooms });
        setPanel("party");
    }, [ query.adults, query.children, query.rooms ]);

    const setParty = useCallback(( key: keyof SearchParty, next: number ) => {

        setCrowd(( current ) => {

            const party = { ...current, [key]: next };

            return { ...party, rooms: Math.min(party.rooms, party.adults) };

        });

    }, []);

    const saveParty = useCallback(() => {
        setQuery(( current ) => ({ ...current, ...crowd }) );
        setPanel(null);
    }, [ crowd ]);

    return {
        query,
        request,
        hints,
        submit,
        applyHint,
        clearPlace,
        draft,
        setDraft,
        span,
        crowd,
        panel,
        mapOpen,
        activePin,
        setActivePin,
        setTerm,
        openSort,
        openFilters,
        closePanel,
        selectSort,
        applyFilters,
        resetDraft,
        showMap,
        hideMap,
        searchArea,
        clearArea,
        pickType,
        openDates,
        pickDay,
        saveDates,
        clearDates,
        openParty,
        setParty,
        saveParty,
        toggleFavorite,
        favoriteOf,
        activeFilters: activeFilterCount(query.filters),
    } as const;

}
