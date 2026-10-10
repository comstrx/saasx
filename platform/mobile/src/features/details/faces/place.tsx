import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Divider } from "@/elements/divider";
import type { IconName } from "@/elements/icon";
import { Spec } from "@/elements/spec";
import { HostLine } from "@/features/details/components/host";
import type { DeckProps } from "@/features/details/faces/props";
import { DeckCard, DeckPromises, DeckSplit, DeckStack, type Pledge } from "@/features/details/faces/shell";
import { can } from "@/model/detail";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

const keyed: readonly ( readonly [ string, IconName ] )[] = [
    [ "area", "compass" ],
    [ "floor", "building" ],
];

export function PlaceDeck ({ detail }: DeckProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();

    const count = ( value: number ) => formatNumber(i18n.language, value);

    const traits = keyed
        .map(([ key, icon ]) => ({ key, icon, row: detail.features.find(( item ) => item.key === key ) }) )
        .filter(( entry ) => Boolean(entry.row?.value) );

    const promises: readonly Pledge[] = [
        ...( can(detail, "lodging")
            ? [ { key: "whole", icon: "key" as IconName, title: t("details.face.place.whole"), note: t("details.face.place.wholeBody") } ]
            : [] ),
        ...( detail.host?.verified && detail.host.catalogs > 0
            ? [ {
                key: "host",
                icon: "verified" as IconName,
                title: t("details.face.place.host"),
                note: t("details.face.place.hostBody", { value: count(detail.host.catalogs) }),
            } ]
            : [] ),
    ];

    const host = detail.host;

    return (
        <DeckStack>
            {host ? (
                <View style={{ gap: theme.space["5"] }}>
                    <HostLine host={host} onPress={() => router.push({ pathname: "/vendor/[id]", params: { id: String(host.id), catalog: String(detail.id) } }) } />
                    <Divider />
                </View>
            ) : null}

            {promises.length > 0 ? <DeckPromises items={promises} /> : null}

            {traits.length > 0 || detail.minStay > 0 ? (
                <DeckCard>
                    <View style={{ gap: theme.space["1"] }}>
                        {traits.map(( entry ) => (
                            <Spec
                                key={entry.key}
                                icon={entry.icon}
                                label={entry.row?.label ?? entry.key}
                                value={t(`details.featureUnit.${ entry.key }`, { value: entry.row?.value, count: Number(entry.row?.value), defaultValue: entry.row?.value ?? "" })}
                            />
                        ))}

                        {detail.minStay > 0 ? (
                            <Spec
                                icon="moon"
                                label={t("details.brief.minStay")}
                                value={t("details.specs.span.night", { count: detail.minStay, value: count(detail.minStay) })}
                            />
                        ) : null}
                    </View>
                </DeckCard>
            ) : null}

            {detail.checkin || detail.checkout ? (
                <DeckCard>
                    <DeckSplit
                        lead={{ label: t("details.brief.checkin"), value: detail.checkin || "—" }}
                        tail={{ label: t("details.brief.checkout"), value: detail.checkout || "—" }}
                    />
                </DeckCard>
            ) : null}
        </DeckStack>
    );

}
