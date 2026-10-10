"use client";

import Button from "@/elements/button";
import SearchField from "@/elements/search-field";
import SearchFrame from "@/elements/search-frame";
import SearchPill from "@/elements/search-pill";
import Stack from "@/elements/stack";
import { useSearchBar } from "@/hooks/use-search-bar";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import DatePicker from "./date-picker";
import GuestPicker from "./guest-picker";
import LocationSearch from "./location-search";
import SearchSheet from "./search-sheet";

type Place = { id: string; label: string; detail: string | null; image: string | null };
type Vertical = { href: string; label: string; icon: string | null; current: boolean };
type Props = {
    target: string;
    dates: "stay" | "start" | "none";
    guests: boolean;
    source?: "all" | "places" | "categories";
    sheet: { verticals: { label: string; items: readonly Vertical[] }; popular: readonly Place[] };
};

export default function SearchBar ({ target, dates, guests, source, sheet }: Props) {

    const t = useTranslations("search");
    const search = useSearchBar({ target, dates, guests, source });
    const status = search.busy ? t("searching") : search.failed ? t("suggestFailed") : (
        search.query.trim().length >= 2 && !search.options.length && !search.place ? t("noMatches") : null
    );
    const party = ( kind: "adults" | "children" ) => ({
        label: t(kind),
        less: t(`${kind}Less`),
        more: t(`${kind}More`),
        value: search[kind],
        onChange: ( value: number ) => search.update({ [kind]: value }),
    });
    const where = search.place?.label ?? (search.query.trim() || t("anywhere"));
    const parts = [
        { key: "where", text: where, strong: true },
        ...(dates !== "none" ? [{ key: "when", text: search.dates ?? t("addDates") }] : []),
        ...(guests ? [{ key: "who", text: search.people }] : []),
    ];

    return (

        <>

            <Stack visibility="phone">

                <SearchPill label={t("label")} parts={parts} onOpen={() => search.setSheet(true)} />

            </Stack>

            <SearchSheet
                open={search.sheet}
                section={search.section}
                onOpenChange={search.setSheet}
                onSection={search.setSection}
                labels={{
                    title: t("label"), close: t("close"), where: t("where"), whereTitle: t("whereTitle"),
                    placeholder: t("sheetPlaceholder"),
                    suggestions: t("suggestions"), anywhere: t("anywhere"), when: t("when"), addDates: t("addDates"), who: t("who"),
                    clear: t("clearAll"), submit: t("submit"),
                }}
                verticals={sheet.verticals}
                query={search.query}
                place={search.place}
                places={search.options.filter(( option ) => option.kind === "geo")}
                popular={sheet.popular}
                onQuery={search.setQuery}
                onPlace={search.pick}
                near={{
                    label: t("nearby"), body: t("nearbyBody"), locating: t("locating"), denied: t("nearbyDenied"),
                    busy: search.near.locating, failed: search.near.denied, onLocate: search.near.locate,
                }}
                dates={dates !== "none" ? {
                    locale: search.locale === "ar" ? "ar" : "en", mode: dates === "stay" ? "range" : "single", value: search.range,
                    minimum: search.today, summary: search.dates, onChange: ( range ) => search.update({ range }),
                } : null}
                guests={guests ? {
                    summary: search.people,
                    adults: { ...party("adults"), minimum: 1 },
                    kids: { ...party("children"), minimum: 0 },
                } : null}
                pending={search.pending}
                onClear={search.clear}
                onSubmit={search.go}
            />

            <Stack visibility="tablet">

                <SearchFrame label={t("label")} pending={search.pending} onSubmit={search.submit}>

                    <SearchField kind="primary">

                        <LocationSearch
                            label={dates === "stay" ? t("where") : t("what")}
                            placeholder={t("wherePlaceholder")}
                            query={search.query}
                            value={search.place}
                            items={search.options}
                            busy={search.busy}
                            status={status}
                            onQueryChange={search.setQuery}
                            onSelect={search.select}
                        />

                    </SearchField>

                    {

                        dates !== "none" ? (

                            <SearchField>

                                <DatePicker
                                    locale={search.locale === "ar" ? "ar" : "en"}
                                    label={t("when")}
                                    summary={search.dates ?? t("addDates")}
                                    empty={!search.dates}
                                    clear={t("clearDates")}
                                    done={t("done")}
                                    hint={search.invalid ? t("chooseCheckout") : search.nights}
                                    value={search.range}
                                    minimum={search.today}
                                    mode={dates === "stay" ? "range" : "single"}
                                    open={search.panel === "dates"}
                                    onOpenChange={( open ) => search.setPanel(open ? "dates" : null)}
                                    onChange={( range ) => search.update({ range })}
                                />

                            </SearchField>

                        ) : null

                    }

                    {

                        guests ? (

                            <SearchField>

                                <GuestPicker
                                    label={t("who")}
                                    summary={search.people}
                                    done={t("done")}
                                    adults={party("adults")}
                                    kids={party("children")}
                                    open={search.panel === "guests"}
                                    onOpenChange={( open ) => search.setPanel(open ? "guests" : null)}
                                />

                            </SearchField>

                        ) : null

                    }

                    <SearchField kind="action">

                        <Button type="submit" size="xlarge" rounded="full" width="full" pending={search.pending} aria-label={t("submit")}>

                            <Icon name="search" weight="bold" />

                            {t("submit")}

                        </Button>

                    </SearchField>

                </SearchFrame>

            </Stack>

        </>

    );

}
