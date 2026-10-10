import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Band } from "@/components/band";
import { Button } from "@/elements/button";
import { Divider } from "@/elements/divider";
import { Facts } from "@/elements/facts";
import { Icon } from "@/elements/icon";
import { Price } from "@/elements/price";
import { Spec } from "@/elements/spec";
import { Text } from "@/elements/text";
import { markOf } from "@/features/catalog/marks";
import type { DeckProps } from "@/features/details/faces/props";
import { DeckCard, DeckSplit, DeckStack } from "@/features/details/faces/shell";
import { traitText } from "@/features/details/lang";
import { useMoney } from "@/features/shell/hooks/use-money";
import { marked } from "@/model/detail";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

const shown = 6;

export function HotelDeck ({ detail, picked, onPick, onBook, onPanel }: DeckProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const money = useMoney();

    const count = ( value: number ) => formatNumber(i18n.language, value);
    const rooms = detail.sellables;
    const perks = detail.features.filter(( row ) => row.key !== "star_rating" && row.included !== false ).slice(0, shown);

    return (
        <DeckStack>
            {detail.checkin || detail.checkout ? (
                <DeckCard>
                    <DeckSplit
                        lead={{ label: t("details.brief.checkin"), value: detail.checkin || "—" }}
                        tail={{ label: t("details.brief.checkout"), value: detail.checkout || "—" }}
                    />
                </DeckCard>
            ) : null}

            {perks.length > 0 ? (
                <Band title={t("details.face.hotel.amenities")}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: theme.space["5"], rowGap: theme.space["1"] }}>
                        {perks.map(( perk ) => {

                            const value = traitText(perk, t, i18n.language);

                            return (
                                <View key={perk.key} style={{ flexDirection: "row", alignItems: "center", gap: theme.space["2"], minHeight: theme.control.sm.height }}>
                                    <Icon name={markOf(perk.icon, perk.key)} size={theme.icon.lg} color={theme.ink.strong} />
                                    <Text rank="body" numberOfLines={1}>{value ? `${ perk.label } · ${ value }` : perk.label}</Text>
                                </View>
                            );

                        })}
                    </View>

                    {detail.features.length > perks.length ? (
                        <Button label={t("details.showAmenities", { count: detail.features.length })} kind="soft" tint="neutral" onPress={() => onPanel("amenities") } />
                    ) : null}
                </Band>
            ) : null}

            <Band title={t("details.rooms")} note={rooms.length > 0 ? t("details.roomsCount", { count: rooms.length }) : undefined}>

                {rooms.length > 0
                    ? rooms.map(( room ) => {

                        const on = room.id === picked;
                        const dead = room.soldOut || !room.fits;
                        const facts = room.facts.map(( fact ) => t(`details.featureUnit.${ fact.key }`, { value: fact.value, count: Number(fact.value), defaultValue: "" }) );

                        return (
                            <DeckCard key={room.id} picked={on}>
                                <View style={{ gap: theme.space["3"] }}>
                                    <View style={{ gap: theme.space["1"] }}>
                                        <Text rank="label" numberOfLines={2}>{room.name}</Text>
                                        {facts.some(Boolean) ? <Facts items={facts} /> : null}
                                    </View>

                                    <View style={{ gap: theme.space["1"] }}>
                                        {room.adults > 0 ? (
                                            <Spec icon="users" label={t("details.brief.guests")} value={[
                                                t("details.guestAdults", { count: room.adults }),
                                                room.children > 0 ? t("details.guestChildren", { count: room.children }) : null,
                                            ].filter(Boolean).join(" · ")} />
                                        ) : null}

                                        {room.stock !== null && room.stock > 0 ? (
                                            <Spec icon="stay" label={t("details.brief.roomsLeft")} value={count(room.stock)} tint={room.stock <= 3 ? "danger" : undefined} />
                                        ) : null}
                                    </View>

                                    <Divider />

                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.space["3"] }}>
                                        {room.price
                                            ? <Price amount={money.amount(( marked(room.price, detail.offer) ?? room.price ).amount, room.price.currency)} was={marked(room.price, detail.offer) ? money.amount(room.price.amount, room.price.currency) : undefined} rank="title" unit={t("listing.unit.night", { defaultValue: "" })} />
                                            : <Text rank="caption" ink="soft">{t("listing.onRequest")}</Text>}

                                        <Button
                                            label={room.soldOut ? t("details.soldOut") : room.fits ? on ? t("details.act.hotel") : t("details.choose") : t("details.noFit")}
                                            kind={on ? "solid" : "soft"}
                                            tint={on ? "brand" : "neutral"}
                                            block={false}
                                            disabled={dead}
                                            onPress={() => on ? onBook() : onPick(room.id) }
                                        />
                                    </View>
                                </View>
                            </DeckCard>
                        );

                    })
                    : (
                        <DeckCard>
                            <View style={{ gap: theme.space["4"] }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["3"] }}>
                                    <Icon name="calendar" size={theme.icon.xl} tint="brand" />

                                    <View style={{ flex: 1, gap: theme.space["1"] }}>
                                        <Text rank="label">{t("details.face.hotel.check")}</Text>
                                        <Text rank="caption" ink="soft">{t("details.face.hotel.checkBody")}</Text>
                                    </View>
                                </View>

                                <Button label={t("details.face.hotel.dates")} kind="soft" icon="calendar" onPress={onBook} />
                            </View>
                        </DeckCard>
                    )}
            </Band>
        </DeckStack>
    );

}
