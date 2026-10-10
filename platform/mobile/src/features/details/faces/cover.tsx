import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Strip } from "@/components/strip";
import { type Beat, Timeline } from "@/components/timeline";
import { Chip } from "@/elements/chip";
import { Perk } from "@/elements/perk";
import { Price } from "@/elements/price";
import { Spec } from "@/elements/spec";
import { Text } from "@/elements/text";
import { markOf } from "@/features/catalog/marks";
import type { DeckProps } from "@/features/details/faces/props";
import { DeckCard, DeckStack } from "@/features/details/faces/shell";
import { useMoney } from "@/features/shell/hooks/use-money";
import { factsOf, marked } from "@/model/detail";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

export function CoverDeck ({ detail, picked, onPick }: DeckProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const money = useMoney();

    const seat = detail.sellables.find(( row ) => row.id === picked );
    const price = seat?.price ?? detail.price;
    const parts = factsOf(detail);
    const spans = parts.specs.filter(( fact ) => Boolean(fact.value) );
    const spanned = spans.some(( fact ) => fact.key === "coverage_period" );

    const span = detail.duration > 0
        ? t(`details.specs.span.${ detail.durationUnit || "day" }`, {
            count: detail.duration,
            value: formatNumber(i18n.language, detail.duration),
        })
        : "";

    const beats: readonly Beat[] = [
        { key: "tell", icon: "bell", title: t("details.face.cover.claimOne"), tint: "brand" },
        { key: "papers", icon: "doc", title: t("details.face.cover.claimTwo"), tint: "brand" },
        { key: "paid", icon: "wallet", title: t("details.face.cover.claimThree"), tint: "brand" },
    ];

    return (
        <DeckStack>
            {detail.sellables.length > 1 ? (
                <View style={{ gap: theme.space["3"] }}>
                    <Text rank="label">{t("details.pick.coverage")}</Text>

                    <Strip gap="2">
                        {detail.sellables.map(( row ) => (
                            <Chip key={row.id} label={row.name} live={row.id === picked} disabled={row.soldOut} onPress={() => onPick(row.id) } />
                        ))}
                    </Strip>
                </View>
            ) : null}

            <DeckCard
                title={seat?.name || t("details.face.cover.card")}
                note={t("details.coverNote")}
                foot={price && price.amount > 0 ? (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.space["3"] }}>
                        <Text rank="label" ink="soft">{t("details.crown.perTraveller")}</Text>
                        <Price amount={money.amount(( marked(price, detail.offer) ?? price ).amount, price.currency)} was={marked(price, detail.offer) ? money.amount(price.amount, price.currency) : undefined} rank="title" />
                    </View>
                ) : undefined}
            >
                <View style={{ gap: theme.space["1"] }}>
                    {span && !spanned ? (
                        <Spec
                            icon="shield"
                            label={t("details.face.cover.span")}
                            note={t("details.face.cover.spanBody")}
                            value={span}
                            mark="brand"
                            strong
                        />
                    ) : null}

                    {spans.slice(0, 5).map(( fact ) => (
                        <Spec key={fact.key} icon={markOf(fact.icon, fact.key, "shield")} label={fact.label} value={fact.value} mark="brand" />
                    ))}
                </View>
            </DeckCard>

            {parts.included.length > 0 ? (
                <DeckCard title={t("details.covered")}>
                    <View style={{ gap: theme.space["3"] }}>
                        {parts.included.slice(0, 6).map(( row ) => (
                            <Perk
                                key={row.key}
                                label={row.label}
                                note={row.value || undefined}
                                icon={markOf(row.icon, row.key, "check")}
                                off={row.included === false}
                            />
                        ))}
                    </View>
                </DeckCard>
            ) : null}

            <DeckCard title={t("details.face.cover.claim")}>
                <Timeline beats={beats} />
            </DeckCard>
        </DeckStack>
    );

}
