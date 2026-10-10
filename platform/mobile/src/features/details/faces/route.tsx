import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Strip } from "@/components/strip";
import { Divider } from "@/elements/divider";
import { arrowNext } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Spec } from "@/elements/spec";
import { Status } from "@/elements/status";
import { Text } from "@/elements/text";
import { markOf, vehicleOf } from "@/features/catalog/marks";
import type { DeckProps } from "@/features/details/faces/props";
import { DeckCard, DeckStack } from "@/features/details/faces/shell";
import { traitText } from "@/features/details/lang";
import { expired } from "@/model/detail";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

export function RouteDeck ({ detail, when }: DeckProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();

    const count = ( value: number ) => formatNumber(i18n.language, value);
    const arrives = detail.endsAt !== null;

    const tail = arrives
        ? when.clock(detail.endsAt)
        : detail.duration > 0
        ? t(`details.specs.span.${ detail.durationUnit || "hour" }`, { count: detail.duration, value: count(detail.duration) })
        : "—";

    const marks = detail.features.filter(( row ) => row.key !== "transport_mode" && Boolean(traitText(row, t, i18n.language)) );
    const closed = expired(detail);

    return (
        <DeckStack>
            <DeckCard>
                <View style={{ gap: theme.space["4"] }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["3"] }}>
                        <View style={{ flex: 1, gap: theme.space["1"] }}>
                            <Text rank="note" ink="faint">{t("details.face.route.depart")}</Text>
                            <Text rank="figure" ltr numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{when.clock(detail.startsAt) || "—"}</Text>
                            <Text rank="caption" numberOfLines={1}>{detail.origin?.name || when.date(detail.startsAt)}</Text>
                            {detail.origin ? <Text rank="note" ink="faint" numberOfLines={1}>{when.date(detail.startsAt)}</Text> : null}
                        </View>

                        <View style={{ alignItems: "center", gap: theme.space["1"] }}>
                            <Plate icon={vehicleOf(detail.transportMode) ?? arrowNext} size={theme.control.md.height} look="soft" />
                            <View style={{ height: theme.stroke.thin, width: theme.space["8"], backgroundColor: theme.line.soft }} />
                        </View>

                        <View style={{ flex: 1, gap: theme.space["1"], alignItems: "flex-end" }}>
                            <Text rank="note" ink="faint">{t(arrives ? "details.face.route.arrive" : "details.duration")}</Text>
                            <Text rank="figure" ltr numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{tail}</Text>
                            <Text rank="caption" numberOfLines={1}>{detail.destination?.name || ( arrives ? when.date(detail.endsAt) : detail.place )}</Text>
                            {detail.destination && arrives ? <Text rank="note" ink="faint" numberOfLines={1}>{when.date(detail.endsAt)}</Text> : null}
                        </View>
                    </View>

                    {closed ? <Status label={t("details.face.stage.over")} tint="danger" strong size="sm" /> : null}

                    {marks.length > 0 ? (
                        <Strip gap="2">
                            {marks.map(( mark ) => (
                                <Status key={mark.key} label={`${ mark.label } · ${ traitText(mark, t, i18n.language) }`} tint="neutral" size="sm" />
                            ))}
                        </Strip>
                    ) : null}

                    <Divider />

                    <View style={{ gap: theme.space["1"] }}>
                        {detail.place ? <Spec icon="location" label={t("details.brief.meetPoint")} value={detail.place} mark="brand" /> : null}

                        {detail.capacity > 0 ? (
                            <Spec
                                icon="users"
                                label={t("details.brief.seatsLabel")}
                                value={t("details.brief.seats", { count: detail.capacity, value: count(detail.capacity) })}
                            />
                        ) : null}

                        {detail.host ? <Spec icon={markOf("", "operator", "building")} label={t("details.face.route.operator")} value={detail.host.name} /> : null}
                    </View>
                </View>
            </DeckCard>
        </DeckStack>
    );

}
