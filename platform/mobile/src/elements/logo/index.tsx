import { View } from "react-native";
import { mark, wordmark } from "@/brand/assets";
import { identity } from "@/brand/identity";
import { ArtImage } from "@/elements/art-image";
import { useTheme } from "@/theme/use-theme";

type LogoProps = { size?: number; word?: boolean };

export function Logo ({ size, word = false }: LogoProps) {

    const theme = useTheme();
    const span = size ?? theme.mark.md;
    const source = word ? wordmark[theme.name] : mark.source;
    const ratio = word ? wordmark.ratio : mark.ratio;

    return (
        <View accessible accessibilityLabel={identity.title} accessibilityRole="image" style={{ direction: "ltr", flexShrink: 0 }}>
            <ArtImage source={source} width={span * ratio} height={span} />
        </View>
    );

}
