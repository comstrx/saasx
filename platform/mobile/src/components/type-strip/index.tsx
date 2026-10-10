import { View } from "react-native";
import Animated from "react-native-reanimated";
import { Strip } from "@/components/strip";
import { Art, type Artwork } from "@/elements/art";
import { useGlide } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type TypeSeat = {
    key: string;
    label: string;
    figure: Artwork;
};

export type TypeStripProps = {
    types: readonly TypeSeat[];
    value: string;
    onChange: ( type: string ) => void;
    browse?: { label: string; onPress: () => void } | undefined;
};

function Seat ({ seat, live, onPress, tab = true }: { seat: TypeSeat; live: boolean; onPress: () => void; tab?: boolean }) {

    const theme = useTheme();
    const glide = useGlide("press", "backgroundColor");
    const { width, tile, figure } = theme.composition.domains;

    return (
        <Press
            onPress={onPress}
            sink="control"
            accessibilityRole={tab ? "tab" : "button"}
            accessibilityLabel={seat.label}
            accessibilityState={tab ? { selected: live } : undefined}
            style={{ alignItems: "center", gap: theme.space["2"], width }}
        >
            <Animated.View
                style={{
                    width: tile,
                    height: tile,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: theme.radius.tile,
                    backgroundColor: live ? theme.tone.brand.soft : theme.plane.base,
                    ...glide,
                }}
            >
                <Art name={seat.figure} size={figure} fit="fill" />
            </Animated.View>

            <Text rank="caption" align="center" color={live ? theme.tone.brand.onSoft : undefined} numberOfLines={1}>{seat.label}</Text>
        </Press>
    );

}

export function TypeStrip ({ types, value, onChange, browse }: TypeStripProps) {

    return (
        <View accessibilityRole="tablist">
            <Strip gap="1">
                {types.map(( seat ) => (
                    <Seat key={seat.key} seat={seat} live={seat.key === value} onPress={() => onChange(seat.key)} />
                ))}

                {browse ? <Seat seat={{ key: "browse", label: browse.label, figure: "domain-browse" }} live={false} onPress={browse.onPress} tab={false} /> : null}
            </Strip>
        </View>
    );

}
