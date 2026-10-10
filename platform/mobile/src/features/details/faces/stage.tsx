import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Band } from "@/components/band";
import { Button } from "@/elements/button";
import { Divider } from "@/elements/divider";
import { Price } from "@/elements/price";
import { Spec } from "@/elements/spec";
import { Status } from "@/elements/status";
import { Text } from "@/elements/text";
import type { DeckProps } from "@/features/details/faces/props";
import { DeckCard, DeckStack } from "@/features/details/faces/shell";
import { traitText } from "@/features/details/lang";
import { useMoney } from "@/features/shell/hooks/use-money";
import { daysAway, expired, marked } from "@/model/detail";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

const scarce = 20;

export function StageDeck ({ detail, picked, onPick, onBook, when }: DeckProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const money = useMoney();

    const count = ( value: number ) => formatNumber(i18n.language, value);
    const away = daysAway(detail.startsAt);
    const spanned = Boolean(detail.endsAt) && when.date(detail.endsAt) !== when.date(detail.startsAt);
    const tiers = detail.sellables;
    const section = detail.features.find(( row ) => row.key === "section" );
    const closed = expired(detail);

    const countdown = !detail.startsAt
        ? null
        : away < 0
        ? { label: t("details.face.stage.over"), tint: "neutral" as const }
        : away === 0
        ? { label: t("details.face.stage.today"), tint: "danger" as const }
        : { label: t("details.face.stage.away", { count: away, value: count(away) }), tint: "brand" as const };

    return (
        <DeckStack>
            <DeckCard>
                <View style={{ gap: theme.space["4"] }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["4"] }}>
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: theme.control.lg.height + theme.space["2"],
                                paddingVertical: theme.space["2"],
                                paddingHorizontal: theme.space["3"],
                                ...theme.depth.flat,
                                borderRadius: theme.radius.tile,
                                backgroundColor: theme.tone.neutral.soft,
                            }}
                        >
                            <Text rank="figure" ink="strong" ltr numberOfLines={1}>{when.day(detail.startsAt)}</Text>
                            <Text rank="note" ink="soft" numberOfLines={1}>{when.month(detail.startsAt)}</Text>
                        </View>

                        <View style={{ flex: 1, gap: theme.space["2"] }}>
                            <Text rank="title" numberOfLines={2}>
                                {spanned
                                    ? t("details.brief.window", { from: when.date(detail.startsAt), to: when.date(detail.endsAt) })
                                    : when.date(detail.startsAt)}
                            </Text>

                            {detail.startsAt ? <Text rank="caption" ink="soft" ltr>{when.clock(detail.startsAt)}</Text> : null}

                            {countdown ? <Status label={countdown.label} tint={countdown.tint} strong={countdown.tint === "danger"} size="sm" /> : null}
                        </View>
                    </View>

                    <Divider />

                    <View style={{ gap: theme.space["1"] }}>
                        {detail.place ? <Spec icon="location" label={t("details.face.stage.hall")} value={detail.place} mark="brand" /> : null}

                        {detail.capacity > 0 ? (
                            <Spec
                                icon="users"
                                label={t("details.face.stage.seats")}
                                value={t("details.brief.seats", { count: detail.capacity, value: count(detail.capacity) })}
                                tint={detail.capacity <= scarce ? "danger" : undefined}
                            />
                        ) : null}

                        {section ? (
                            <Spec
                                icon="ticket"
                                label={section.label}
                                value={traitText(section, t, i18n.language)}
                            />
                        ) : null}
                    </View>
                </View>
            </DeckCard>

            {tiers.length > 0 ? (
                <Band title={t("details.pick.stage")}>
                    {tiers.map(( tier ) => {

                        const on = tier.id === picked;
                        const dead = closed || tier.soldOut || !tier.fits;

                        return (
                            <DeckCard key={tier.id} picked={on}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["3"] }}>
                                    <View style={{ flex: 1, gap: theme.space["1"] }}>
                                        <Text rank="label" numberOfLines={2}>{tier.name}</Text>

                                        {tier.stock !== null && tier.stock > 0 ? (
                                            <Text rank="caption" ink="soft">{t("details.brief.seats", { count: tier.stock, value: count(tier.stock) })}</Text>
                                        ) : null}
                                    </View>

                                    {tier.price ? <Price amount={money.amount(( marked(tier.price, detail.offer) ?? tier.price ).amount, tier.price.currency)} was={marked(tier.price, detail.offer) ? money.amount(tier.price.amount, tier.price.currency) : undefined} rank="title" /> : null}

                                    <Button
                                        label={dead ? t("details.soldOut") : on ? t("details.act.stage") : t("details.choose")}
                                        kind={on ? "solid" : "soft"}
                                        block={false}
                                        disabled={dead}
                                        onPress={() => on ? onBook() : onPick(tier.id) }
                                    />
                                </View>
                            </DeckCard>
                        );

                    })}
                </Band>
            ) : null}
        </DeckStack>
    );

}
