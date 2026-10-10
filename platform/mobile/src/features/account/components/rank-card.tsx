import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Art } from "@/elements/art";
import { Text } from "@/elements/text";
import type { Level } from "@/model/level";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

type RankCardProps = {
    level: Level;
    points: number;
    next?: string | undefined;
};

export function RankCard ({ level, points, next }: RankCardProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();

    return (
        <View
            style={{
                ...theme.card,
                flexDirection: "row",
                alignItems: "center",
                gap: theme.space["4"],
                padding: theme.space["5"],
                borderRadius: theme.radius.panel,
                backgroundColor: theme.plane.base,
            }}
        >
            <Art name="member" size={theme.art.sm} />

            <View style={{ flex: 1, minWidth: 0, gap: theme.space["1"] }}>
                <Text rank="label" tint="brand" numberOfLines={1}>{level.rank > 0 ? t("level.rank", { rank: level.rank }) : next ? t("level.onTheWay") : t("level.unranked")}</Text>
                <Text rank="heading" numberOfLines={1}>{level.rank > 0 ? level.name : next ?? t("level.rank", { rank: level.progress?.rank ?? 1 })}</Text>
            </View>

            <View style={{ alignItems: "flex-end", gap: theme.space["1"] }}>
                <Text rank="price" figures>{formatNumber(i18n.language, Math.round(points))}</Text>
                <Text rank="caption" ink="soft" numberOfLines={1}>{t("level.points")}</Text>
            </View>
        </View>
    );

}
