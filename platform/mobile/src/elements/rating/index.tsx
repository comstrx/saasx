import { View } from "react-native";
import { Icon } from "@/elements/icon";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type RatingProps = {
    score: number;
    reviews?: number | undefined;
    stars?: boolean | undefined;
    plain?: boolean | undefined;
    size?: number | undefined;
};

const shape = ( score: number, seat: number ): "ratingStar" | "ratingStarHalf" | "ratingStarEmpty" => {

    if ( score >= seat + 1 ) return "ratingStar";
    if ( score >= seat + 0.5 ) return "ratingStarHalf";

    return "ratingStarEmpty";

};

export function Rating ({ score, reviews, stars = false, plain = false, size }: RatingProps) {

    const theme = useTheme();
    const glyph = size ?? theme.icon.sm;

    return (
        <View accessibilityRole="text" accessibilityLabel={`${ score.toFixed(1) }`} style={{ flexDirection: "row", alignItems: "center", flexShrink: 0, gap: theme.space["2"] }}>
            {stars || plain ? (
                <View style={{ flexDirection: "row", gap: theme.space["1"], direction: "ltr" }}>
                    {[ 0, 1, 2, 3, 4 ].map(( seat ) => <Icon key={seat} name={shape(score, seat)} size={glyph} tint="star" />)}
                </View>
            ) : <Icon name="ratingStar" size={glyph} tint="star" />}

            {plain ? null : <Text rank="label" ltr figures>{score.toFixed(1)}</Text>}

            {plain || reviews === undefined ? null : <Text rank="caption" ink="faint" ltr figures>{`(${ reviews })`}</Text>}
        </View>
    );

}
