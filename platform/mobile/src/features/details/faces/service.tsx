import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { type Beat, Timeline } from "@/components/timeline";
import { Spec } from "@/elements/spec";
import type { DeckProps } from "@/features/details/faces/props";
import { DeckCard, DeckStack } from "@/features/details/faces/shell";
import { traitText } from "@/features/details/lang";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

export function ServiceDeck ({ detail, when }: DeckProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();

    const count = ( value: number ) => formatNumber(i18n.language, value);
    const level = detail.features.find(( row ) => row.key === "experience_level" );

    const beats: readonly Beat[] = [
        { key: "ask", icon: "edit", title: t("details.face.service.askTitle"), note: t("details.face.service.askBody"), tint: "brand" },
        { key: "come", icon: "chat", title: t("details.face.service.comeTitle"), note: t("details.face.service.comeBody"), tint: "brand" },
        { key: "done", icon: "checkCircle", title: t("details.face.service.doneTitle"), note: t("details.face.service.doneBody"), tint: "brand" },
    ];

    return (
        <DeckStack>
            <DeckCard>
                <View style={{ gap: theme.space["1"] }}>
                    <Spec
                        icon={detail.digital ? "bolt" : "location"}
                        label={t("details.face.service.mode")}
                        value={t(detail.digital ? "details.brief.online" : "details.brief.onsite")}
                        mark="brand"
                    />

                    {detail.duration > 0 ? (
                        <Spec
                            icon="clock"
                            label={t("details.duration")}
                            value={t(`details.specs.span.${ detail.durationUnit || "hour" }`, { count: detail.duration, value: count(detail.duration) })}
                        />
                    ) : null}

                    {level ? (
                        <Spec icon="rank" label={t("details.face.service.level")} value={traitText(level, t, i18n.language)} />
                    ) : null}

                    {detail.startsAt ? <Spec icon="calendar" label={t("details.specs.starts")} value={when.moment(detail.startsAt)} /> : null}
                </View>
            </DeckCard>

            <DeckCard title={t("details.face.service.how")}>
                <Timeline beats={beats} />
            </DeckCard>
        </DeckStack>
    );

}
