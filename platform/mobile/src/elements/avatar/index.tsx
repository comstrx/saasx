import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "@/elements/icon";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";
import { ramp } from "@/theme/wash";

type AvatarProps = {
    source?: string | null | undefined;
    name?: string | null | undefined;
    size?: number | undefined;
    ring?: boolean | undefined;
    halo?: boolean | undefined;
};

const initial = ( name: string ): string => [ ...name.trim() ][0] ?? "";

export function Avatar ({ source, name, size = 44, ring = false, halo = false }: AvatarProps) {

    const theme = useTheme();
    const surface = useSurface();
    const [ failed, setFailed ] = useState(false);
    const letter = name ? initial(name) : "";
    const seat = theme.tone.brand.soft;
    const paint = theme.tone.brand.onSoft;
    const band = theme.stroke.thin;
    const disc = halo ? size - ( band + theme.stroke.base ) * 2 : size;

    const portrait = (
        <View
            style={{
                width: disc,
                height: disc,
                borderRadius: disc / 2,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: seat,
                boxShadow: theme.depth.lift.boxShadow,
                ...( ring ? { borderWidth: theme.stroke.base, borderColor: theme.plane.base } : {} ),
            }}
        >
            {source && !failed ? (
                <Image
                    source={source}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={theme.beat.quick}
                    cachePolicy="memory-disk"
                    onError={() => setFailed(true) }
                />
            ) : letter ? (
                <Text rank={disc >= theme.art.sm ? "figure" : disc >= theme.control.md.height ? "display" : "title"} color={paint}>
                    {letter}
                </Text>
            ) : (
                <Icon name="account" size={Math.round(disc * 0.5)} color={paint} />
            )}
        </View>
    );

    if ( !halo ) return portrait;

    return (
        <View
            style={{
                width: size,
                height: size,
                padding: band,
                borderRadius: size / 2,
                boxShadow: theme.depth.lift.boxShadow,
                experimental_backgroundImage: ramp(theme.tone.brand.bright, theme.tone.accent.bright, 135),
            }}
        >
            <View style={{ flex: 1, padding: theme.stroke.base, borderRadius: size / 2, backgroundColor: theme.plane[surface] }}>
                {portrait}
            </View>
        </View>
    );

}
