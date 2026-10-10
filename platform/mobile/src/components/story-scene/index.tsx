import { View } from "react-native";
import { Art, type Artwork } from "@/elements/art";
import { Fireflies } from "@/elements/fireflies";
import { useTheme } from "@/theme/use-theme";

type StorySceneProps = { figure: Artwork; size: number; active: boolean };

export function StoryScene ({ figure, size, active }: StorySceneProps) {

    const theme = useTheme();

    return (
        <View pointerEvents="none" accessible={false} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Art name={figure} size={size * theme.composition.storyScene.figure} fit="contain" />
            <Fireflies size={size} active={active} />
        </View>
    );

}
