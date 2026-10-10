import { View } from "react-native";
import { Art, type Artwork } from "@/elements/art";
import { Fireflies } from "@/elements/fireflies";
import { useTheme } from "@/theme/use-theme";
import { halo } from "@/theme/wash";

type StageProps = {
    figure: Artwork;
    size?: number | undefined;
    active?: boolean | undefined;
};

export function Stage ({ figure, size, active = false }: StageProps) {

    const theme = useTheme();
    const side = size ?? theme.composition.scene.full;
    const scene = theme.composition.authScene;
    const night = theme.name === "dark";

    return (
        <View
            pointerEvents="none"
            accessible={false}
            style={{
                alignSelf: "center", alignItems: "center", justifyContent: "center",
                width: side, height: side,
                marginTop: theme.space["6"], marginBottom: theme.space["4"],
            }}
        >
            <View style={{
                position: "absolute", width: side * scene.glow, height: side * scene.glow,
                experimental_backgroundImage: halo(theme.tone.brand.base, night ? scene.glowTint.night : scene.glowTint.day, scene.glowCore),
            }} />

            <Fireflies size={side} active={active} />

            <Art name={figure} size={side * scene.figure} />
        </View>
    );

}
