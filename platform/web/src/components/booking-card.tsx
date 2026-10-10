"use client";

import { useId } from "react";
import ActionBar from "@/elements/action-bar";
import Amount from "@/elements/amount";
import Button from "@/elements/button";
import Divider from "@/elements/divider";
import FieldGroup from "@/elements/field-group";
import Link from "@/elements/link";
import Rating from "@/elements/rating";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Stepper from "@/elements/stepper";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { type BookingOptions, useBookingCard } from "@/hooks/use-booking-card";
import type { ProductCardData } from "@/hooks/use-product-card";
import Icon from "@/icons/icon";
import AvailabilityStatus from "./availability-status";
import DatePicker from "./date-picker";
import GuestPicker from "./guest-picker";
import SaveToCart from "./save-to-cart";
import StayQuote from "./stay-quote";

type Supply = { stock: { tone: "success" | "warning" | "danger"; label: string } | null; delivery: string | null; seller: string | null };
type Props = BookingOptions & {
    price: ProductCardData["price"]; layout?: "card" | "strip"; purpose?: "reserve" | "buy"; note?: string; supply?: Supply | null;
};

const tones = { success: "positive", warning: "attention", danger: "negative" } as const;

export default function BookingCard ({ layout = "card", purpose = "reserve", note, supply, ...props }: Props) {

    const id = useId();
    const booking = useBookingCard(props, id);
    const { t, search } = booking;
    const shown = booking.roomPrice ?? props.price?.now;
    const currencies = new Intl.DisplayNames([booking.locale], { type: "currency" });
    const currencyLabel = currencies.of(shown?.currency ?? props.currency) ?? props.currency;
    const strip = layout === "strip";
    const size = strip ? "xlarge" : "large";
    const shape = strip ? "full" : "soft";
    const width = strip ? "auto" : "full";
    const noticed = Boolean(booking.error) || (booking.checked && props.dated);
    const room = props.rooms.length ? (

        <Select
            id={id}
            label={t("option")}
            value={booking.roomId}
            options={booking.rooms}
            size={strip ? "large" : "medium"}
            onValueChange={( value ) => booking.setRoomId(value)}
        />

    ) : null;
    const dates = props.dated && !props.starts ? (

        <DatePicker
            locale={booking.locale}
            label={props.stay ? t("dates") : t("date")}
            summary={booking.dates}
            empty={!booking.range.from}
            clear={search("clearDates")}
            done={search("done")}
            value={booking.range}
            minimum={booking.today}
            mode={props.stay ? "range" : "single"}
            open={booking.panel === "dates"}
            look={strip || !props.stay ? "box" : "cell"}
            split={strip ? null : booking.split}
            onOpenChange={( open ) => booking.setPanel(open ? "dates" : null)}
            onChange={booking.setRange}
        />

    ) : null;
    const party = props.stay ? (

        <GuestPicker
            label={t("guests")}
            summary={booking.people}
            done={search("done")}
            open={booking.panel === "guests"}
            look={strip ? "box" : "cell"}
            onOpenChange={( open ) => booking.setPanel(open ? "guests" : null)}
            adults={{
                value: booking.adults, label: search("adults"),
                less: search("adultsLess"), more: search("adultsMore"), onChange: booking.setAdults,
            }}
            kids={{
                value: booking.children, label: search("children"),
                less: search("childrenLess"), more: search("childrenMore"), onChange: booking.setChildren,
            }}
        />

    ) : (

        <Stepper
            label={t("quantity")}
            value={booking.quantity}
            minimum={props.minimum}
            maximum={props.maximum ?? Number.MAX_SAFE_INTEGER}
            decrease={t("quantityLess")}
            increase={t("quantityMore")}
            onChange={booking.setQuantity}
        />

    );
    const actions = (

        <>

            {props.checkout ? (

                <Button size={size} width={width} rounded={shape} onClick={booking.proceed}>

                    {purpose === "buy" ? <Icon name="bag" /> : null}

                    {purpose === "buy" ? t("buy") : strip ? t("reserve") : t("reserveNow")}

                </Button>

            ) : null}

            {props.dated && (strip || !props.stay) ? (

                <Button variant="outlined" size={size} width={width} rounded={shape} onClick={booking.check}>

                    <Icon name="calendar-check" />

                    {t("checkAvailability")}

                </Button>

            ) : null}

        </>

    );
    const total = booking.quote.quote?.total ? booking.quote.quote : null;
    const bar = (

        <ActionBar
            label={t("label")}
            start={total?.total ? (

                <Stack gap={0}>

                    <Amount {...total.total} currencyLabel={currencyLabel} size="large" />

                    <Text as="span" size="label" tone="muted">

                        <Link href="#booking" variant="inline">{total.length}</Link> · {total.taxes}

                    </Text>

                </Stack>

            ) : shown ? (

                <Stack direction="row" align="baseline" gap={1} wrap>

                    <Amount {...shown} currencyLabel={currencyLabel} size="large" />

                    {props.price?.unit ? <Text as="span" size="small" tone="muted">{props.price.unit}</Text> : null}

                </Stack>

            ) : null}
            action={

                <Button size="large" onClick={booking.reserve}>

                    {purpose === "buy" ? <Icon name="bag" /> : null}

                    {purpose === "buy" ? t("buy") : t("reserveNow")}

                </Button>

            }
        />

    );
    const feedback = (

        <>

            {booking.error ? <Text size="small" tone="danger" role="alert">{booking.error}</Text> : null}

            {booking.checked && props.dated ? <AvailabilityStatus key={JSON.stringify(booking.input)} input={booking.input} /> : null}

        </>

    );

    if ( strip ) return (

        <Surface id="booking" tabIndex={-1} padding={4} radius="xl" elevation="medium">

            <Stack gap={4}>

                <Stack direction="wide" gap={3} align="wide">

                    {room ? <Stack grow>{room}</Stack> : null}

                    {dates ? <Stack grow>{dates}</Stack> : null}

                    <Stack grow>{party}</Stack>

                    <Stack direction="row" gap={2} wrap>{actions}</Stack>

                </Stack>

                {feedback}

                {bar}

            </Stack>

        </Surface>

    );

    return (

        <Surface id="booking" tabIndex={-1} padding={6} radius="lg" elevation="medium">

            <Stack gap={5}>

                <Stack direction="row" align="center" justify="between" gap={3} wrap>

                    {shown ? (

                        <Stack direction="row" align="baseline" gap={2}>

                            <Amount {...shown} size="hero" currencyLabel={currencyLabel} />

                            {props.price?.unit ? <Text as="span" size="small" tone="muted">{props.price.unit}</Text> : null}

                        </Stack>

                    ) : null}

                    {props.rating ? <Rating {...props.rating} size="medium" /> : null}

                </Stack>

                {note ? <Text size="label" tone="muted">{note}</Text> : null}

                {room}

                {props.stay && dates ? <FieldGroup label={t("label")}>{dates}{party}</FieldGroup> : <>{dates}{party}</>}

                {supply ? (

                    <Stack gap={3}>

                        {supply.stock ? (

                            <Status tone={tones[supply.stock.tone]} icon={<Icon name="package" size="sm" />}>{supply.stock.label}</Status>

                        ) : null}

                        {supply.delivery ? (

                            <Stack direction="row" align="start" gap={2}>

                                <Icon name="truck" size="md" tone="accent" />

                                <Text as="span" size="small">{supply.delivery}</Text>

                            </Stack>

                        ) : null}

                        {supply.seller ? (

                            <Stack direction="row" align="start" gap={2}>

                                <Icon name="store" size="md" tone="muted" />

                                <Text as="span" size="small" tone="muted">{t("soldBy", { seller: supply.seller })}</Text>

                            </Stack>

                        ) : null}

                    </Stack>

                ) : null}

                {!supply && booking.perks.length ? (

                    <Surface tone="track" border={false} elevation="none" padding={4} radius="md">

                        <Stack as="ul" gap={2}>

                            {booking.perks.map(( perk ) => (

                                <Stack as="li" key={perk} direction="row" align="center" gap={2}>

                                    <Icon name="check" size="sm" weight="bold" tone="success" />

                                    <Text as="span" size="small" weight="medium">{perk}</Text>

                                </Stack>

                            ))}

                        </Stack>

                    </Surface>

                ) : null}

                {props.stay && booking.priced ? <StayQuote data={booking.quote} currencyLabel={currencyLabel} /> : null}

                <Stack gap={2}>

                    {actions}

                    {purpose === "buy" && props.cart ? (

                        <SaveToCart
                            input={{ productId: props.productId, quantity: booking.quantity }}
                            href={props.cart}
                            validate={() => true}
                        />

                    ) : null}

                </Stack>

                <Stack direction="row" align="center" justify="center" gap={2}>

                    <Icon name="shield" size="sm" tone="success" />

                    <Text as="span" size="label" tone="muted">{purpose === "buy" ? t("secure") : t("noCharge")}</Text>

                </Stack>

                {noticed ? <Divider /> : null}

                {feedback}

                {bar}

            </Stack>

        </Surface>

    );

}
