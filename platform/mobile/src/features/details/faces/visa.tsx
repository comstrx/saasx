import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Strip } from "@/components/strip";
import { type Beat, Timeline } from "@/components/timeline";
import { Chip } from "@/elements/chip";
import type { IconName } from "@/elements/icon";
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

type Line = {
    key: string;
    icon: IconName;
    label: string;
    value: string;
};

export function VisaDeck ({ detail, picked, onPick, when }: DeckProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const money = useMoney();

    const seat = detail.sellables.find(( row ) => row.id === picked );
    const price = seat?.price ?? detail.price;
    const paper = factsOf(detail).specs.filter(( fact ) => Boolean(fact.value) );
    const spanned = paper.some(( fact ) => fact.key === "processing_time" );

    const span = detail.duration > 0
        ? t(`details.specs.span.${ detail.durationUnit || "day" }`, {
            count: detail.duration,
            value: formatNumber(i18n.language, detail.duration),
        })
        : "";

    const lines: readonly Line[] = [
        ...paper.slice(0, 6).map(( fact ) => ({
            key: fact.key,
            icon: markOf(fact.icon, fact.key, "docCheck"),
            label: fact.label,
            value: fact.value,
        })),
        ...( span && !spanned
            ? [ { key: "processing", icon: "clock" as IconName, label: t("details.brief.processing"), value: span } ]
            : [] ),
        ...( detail.startsAt
            ? [ { key: "starts", icon: "calendar" as IconName, label: t("details.specs.starts"), value: when.date(detail.startsAt) } ]
            : [] ),
    ];

    const beats: readonly Beat[] = [
        { key: "apply", icon: "edit", title: t("details.face.visa.applyTitle"), note: t("details.face.visa.applyBody"), tint: "brand" },
        { key: "work", icon: "history", title: t("details.face.visa.workTitle"), note: t("details.face.visa.workBody"), at: span || undefined, tint: "brand" },
        { key: "done", icon: "passport", title: t("details.face.visa.doneTitle"), note: t("details.face.visa.doneBody"), tint: "brand" },
    ];

    return (
        <DeckStack>
            {detail.sellables.length > 1 ? (
                <View style={{ gap: theme.space["3"] }}>
                    <Text rank="label">{t("details.pick.document")}</Text>

                    <Strip gap="2">
                        {detail.sellables.map(( row ) => (
                            <Chip
                                key={row.id}
                                label={row.name}
                                live={row.id === picked}
                                disabled={row.soldOut}
                                onPress={() => onPick(row.id) }
                            />
                        ))}
                    </Strip>
                </View>
            ) : null}

            <DeckCard
                title={seat?.name || t("details.face.visa.card")}
                foot={price && price.amount > 0 ? (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.space["3"] }}>
                        <Text rank="label" ink="soft">{t("details.crown.perTraveller")}</Text>
                        <Price amount={money.amount(( marked(price, detail.offer) ?? price ).amount, price.currency)} was={marked(price, detail.offer) ? money.amount(price.amount, price.currency) : undefined} rank="title" />
                    </View>
                ) : undefined}
            >
                {lines.length === 0 ? null : (
                    <View style={{ gap: theme.space["1"] }}>
                        {lines.map(( line ) => (
                            <Spec key={line.key} icon={line.icon} label={line.label} value={line.value} mark="brand" />
                        ))}
                    </View>
                )}
            </DeckCard>

            <DeckCard title={t("details.face.visa.how")}>
                <Timeline beats={beats} />
            </DeckCard>
        </DeckStack>
    );

}
