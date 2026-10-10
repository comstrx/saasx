"use client";

import type { ReactNode } from "react";
import Button from "@/elements/button";
import Calendar from "@/elements/calendar";
import Field from "@/elements/field";
import Heading from "@/elements/heading";
import Media from "@/elements/media";
import Sheet from "@/elements/sheet";
import Spinner from "@/elements/spinner";
import Stack from "@/elements/stack";
import Stepper from "@/elements/stepper";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import type { SheetSection } from "@/hooks/use-search-bar";
import Icon from "@/icons/icon";
import type { DateRange, SearchPlace } from "@/lib/std/search";
import VerticalTabs from "./vertical-tabs";

type Place = { id: string; label: string; detail: string | null; image?: string | null };
type Guest = { label: string; less: string; more: string; value: number; minimum: number; onChange: ( value: number ) => void };
type Props = {
    open: boolean;
    section: SheetSection;
    onOpenChange: ( open: boolean ) => void;
    onSection: ( section: SheetSection ) => void;
    labels: {
        title: string; close: string; where: string; whereTitle: string; placeholder: string; suggestions: string; anywhere: string;
        when: string; addDates: string; who: string; clear: string; submit: string;
    };
    verticals: { label: string; items: readonly { href: string; label: string; icon: string | null; current: boolean }[] };
    query: string;
    place: SearchPlace | null;
    places: readonly Place[];
    popular: readonly Place[];
    onQuery: ( query: string ) => void;
    onPlace: ( place: SearchPlace ) => void;
    near: { label: string; body: string; locating: string; denied: string; busy: boolean; failed: boolean; onLocate: () => void };
    dates: {
        locale: "ar" | "en"; mode: "range" | "single"; value: DateRange; minimum: Date; summary: string | null;
        onChange: ( range: DateRange ) => void;
    } | null;
    guests: { summary: string; adults: Guest; kids: Guest } | null;
    pending: boolean;
    onClear: () => void;
    onSubmit: () => void;
};

function Row ({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {

    return (

        <Button variant="ghost" width="full" align="start" onClick={onClick}>

            <Stack direction="row" align="center" justify="between" gap={3} width="full">

                <Text as="span" size="small" tone="muted">{label}</Text>

                <Text as="span" size="small" weight="semibold" truncate>{value}</Text>

            </Stack>

        </Button>

    );

}
function Card ({ children }: { children: ReactNode }) {

    return <Surface padding={4} radius="lg" elevation="medium">{children}</Surface>;

}
export default function SearchSheet ( props: Props ) {

    const { labels } = props;
    const typing = props.query.trim().length >= 2;
    const list = typing ? props.places : props.popular;
    const near = props.near;
    const pin = near.busy ? <Spinner label={near.locating} size="small" /> : <Icon name="pin" tone="primary" />;

    return (

        <Sheet
            full
            open={props.open}
            onOpenChange={props.onOpenChange}
            title={labels.title}
            close={labels.close}
            head={<VerticalTabs {...props.verticals} />}
            footer={

                <>

                    <Button variant="link" onClick={props.onClear}>{labels.clear}</Button>

                    <Button size="large" pending={props.pending} onClick={props.onSubmit}>

                        <Icon name="search" weight="bold" />

                        {labels.submit}

                    </Button>

                </>

            }
        >

            <Card>

                {props.section === "where" ? (

                    <Stack gap={4}>

                        <Heading level={2} size="h2">{labels.whereTitle}</Heading>

                        <Field
                            id="sheet-where" label={labels.where} labelHidden placeholder={labels.placeholder} value={props.query}
                            start={<Icon name="search" />} enterKeyHint="search" autoComplete="off"
                            onChange={( event ) => props.onQuery(event.target.value)}
                        />

                        {list.length || !typing ? (

                            <Stack gap={2}>

                                <Text size="label" tone="muted">{labels.suggestions}</Text>

                                <Stack as="ul" gap={1}>

                                    {typing ? null : (

                                        <Stack as="li">

                                            <Button variant="ghost" width="full" align="start" disabled={near.busy} onClick={near.onLocate}>

                                                <Stack direction="row" align="center" gap={3} width="full">

                                                    <Media
                                                        src={null} alt="" ratio="square" radius="small" width="icon"
                                                        placeholder={pin}
                                                    />

                                                    <Stack gap={0}>

                                                        <Text as="span" size="value" weight="semibold">{near.label}</Text>

                                                        <Text as="span" size="label" tone={near.failed ? "danger" : "muted"} role="status">

                                                            {near.busy ? near.locating : near.failed ? near.denied : near.body}

                                                        </Text>

                                                    </Stack>

                                                </Stack>

                                            </Button>

                                        </Stack>

                                    )}

                                    {list.map(( item ) => (

                                        <Stack as="li" key={item.id}>

                                            <Button
                                                variant="ghost" width="full" align="start"
                                                onClick={() => props.onPlace({ ...item, kind: "geo" })}
                                            >

                                                <Stack direction="row" align="center" gap={3} width="full">

                                                    <Media
                                                        src={item.image} alt="" ratio="square" radius="small" width="icon"
                                                        placeholder={<Icon name="pin" tone="primary" />}
                                                    />

                                                    <Stack gap={0}>

                                                        <Text as="span" size="value" weight="semibold" dir="auto">{item.label}</Text>

                                                        {item.detail ? (

                                                            <Text as="span" size="label" tone="muted">{item.detail}</Text>

                                                        ) : null}

                                                    </Stack>

                                                </Stack>

                                            </Button>

                                        </Stack>

                                    ))}

                                </Stack>

                            </Stack>

                        ) : null}

                    </Stack>

                ) : (

                    <Row
                        label={labels.where} value={props.place?.label ?? (props.query || labels.anywhere)}
                        onClick={() => props.onSection("where")}
                    />

                )}

            </Card>

            {props.dates ? (

                <Card>

                    {props.section === "when" ? (

                        <Stack gap={4}>

                            <Heading level={2} size="h3">{labels.when}</Heading>

                            <Calendar
                                locale={props.dates.locale} value={props.dates.value} minimum={props.dates.minimum} mode={props.dates.mode}
                                onChange={props.dates.onChange}
                            />

                        </Stack>

                    ) : (

                        <Row label={labels.when} value={props.dates.summary ?? labels.addDates} onClick={() => props.onSection("when")} />

                    )}

                </Card>

            ) : null}

            {props.guests ? (

                <Card>

                    {props.section === "who" ? (

                        <Stack gap={5}>

                            <Heading level={2} size="h3">{labels.who}</Heading>

                            {[props.guests.adults, props.guests.kids].map(( guest ) => (

                                <Stepper
                                    key={guest.label} label={guest.label} value={guest.value} minimum={guest.minimum} maximum={30}
                                    decrease={guest.less} increase={guest.more} onChange={guest.onChange}
                                />

                            ))}

                        </Stack>

                    ) : <Row label={labels.who} value={props.guests.summary} onClick={() => props.onSection("who")} />}

                </Card>

            ) : null}

        </Sheet>

    );

}
