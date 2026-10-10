export type DateRange = { from?: Date; to?: Date };
export type SearchPlace = { id: string; label: string; detail: string | null; kind: "geo" | "category" | "catalog" | "near" };
type Query = { get: ( key: string ) => string | null };
type Search = { query: string; place: SearchPlace | null; range: DateRange; adults: number; children: number };

export function nearPoint ( value: string ): { lat: number; lng: number } | null {

    const match = /^(-?\d{1,2}(?:\.\d{1,6})?),(-?\d{1,3}(?:\.\d{1,6})?)$/.exec(value);
    const lat = Number(match?.[1]);
    const lng = Number(match?.[2]);

    return match && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;

}
export function calendarDate ( value: string | null ): Date | undefined {

    if ( !value || !/^\d{4}-\d{2}-\d{2}$/.test(value) ) return undefined;

    const [year = 0, month = 0, day = 0] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;

}
export function dateValue ( date: Date ): string {

    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");

}
export function calendarNights ( range: DateRange ): number {

    if ( !range.from || !range.to ) return 0;

    const utc = ( day: Date ) => Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());

    return Math.max(0, Math.round((utc(range.to) - utc(range.from)) / 86400000));

}
export function searchState ( query: Query ): Search {

    const label = query.get("where");
    const geo = query.get("geo");
    const category = query.get("category");
    const near = query.get("near");
    const id = geo ?? category ?? (near && nearPoint(near) ? near : null);
    const party = ( key: string, fallback: number, min: number ) => {

        const raw = query.get(key);
        const number = raw === null || raw === "" ? fallback : Number(raw);

        return Number.isInteger(number) && number >= min && number <= 30 ? number : fallback;

    };
    const from = calendarDate(query.get("from"));
    const end = calendarDate(query.get("to"));
    const to = from && end && end > from ? end : undefined;

    return {
        query: label && id ? label : query.get("query") ?? "",
        place: label && id ? { id, label, detail: null, kind: geo ? "geo" : category ? "category" : "near" } : null,
        range: { from, to },
        adults: party("adults", 2, 1),
        children: party("children", 0, 0),
    };

}
export function searchQuery ( state: Search, dates: "stay" | "start" | "none", guests: boolean ): URLSearchParams {

    const query = new URLSearchParams();
    const text = state.query.trim();
    const chosen = state.place;

    if ( chosen && chosen.label === state.query && chosen.kind !== "catalog" ) {

        query.set(chosen.kind, chosen.id);
        query.set("where", chosen.label);

    }
    else if ( text ) {

        query.set("query", text);

    }

    if ( dates !== "none" && state.range.from ) query.set("from", dateValue(state.range.from));
    if ( dates === "stay" && state.range.to ) query.set("to", dateValue(state.range.to));
    if ( guests ) query.set("adults", String(state.adults));
    if ( guests && state.children ) query.set("children", String(state.children));

    return query;

}
export function searchSuggestion ( row: { id: number; type?: string | null; label?: string | null } ): SearchPlace | null {

    if ( row.type !== "geo" && row.type !== "category" && row.type !== "catalog" ) return null;

    const [label = "", ...detail] = (row.label ?? "").split(" · ");

    return label ? { id: String(row.id), label, detail: detail.join(" · ") || null, kind: row.type } : null;

}
export function calendarToday ( timeZone: string ): Date {

    const parts = new Intl.DateTimeFormat("en", { timeZone, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date());
    const part = ( key: string ) => Number(parts.find(( row ) => row.type === key)?.value);

    return new Date(part("year"), part("month") - 1, part("day"));

}
