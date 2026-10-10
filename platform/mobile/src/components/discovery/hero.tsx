import { View } from "react-native";
import { arrowNext, Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { above } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

export type DiscoveryHeroProps = {
    label: string;
    onPress: () => void;
};

function Disc ({ icon, fill, ink }: { icon: IconName; fill: string; ink: string }) {

    const theme = useTheme();
    const size = theme.mark.md;

    return (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", borderRadius: size / 2, backgroundColor: fill }}>
            <Icon name={icon} size={theme.icon.md} color={ink} />
        </View>
    );

}

export function DiscoveryHero ({ label, onPress }: DiscoveryHeroProps) {

    const theme = useTheme();
    const inset = ( theme.control.lg.height - theme.mark.md ) / 2;

    return (
        <Press
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            sink="tile"
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.space["3"],
                minHeight: theme.control.lg.height,
                paddingHorizontal: inset,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.plane.base,
            }}
        >
            <Disc icon="sections" fill={theme.tone.brand.soft} ink={theme.tone.brand.onSoft} />
            <Text rank="title" style={{ flex: 1 }} numberOfLines={1}>{label}</Text>
            <Disc icon={arrowNext} fill={theme.plane[above("base", theme.name === "dark")]} ink={theme.ink.strong} />
        </Press>
    );

}
