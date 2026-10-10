import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Still } from "@/components/still";
import { Box } from "@/elements/box";
import { chevronNext, Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { nativeMaps } from "@/features/shell/maps";
import { useTheme } from "@/theme/use-theme";

type LocationCardProps = {
    place: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    onOpen?: (() => void) | undefined;
};

export function LocationCard ({ place, latitude, longitude, onOpen }: LocationCardProps) {

    const { t } = useTranslation();
    const theme = useTheme();

    const plotted = latitude !== undefined && longitude !== undefined;

    if ( !plotted ) {

        return (
            <Press style={styles.row} onPress={onOpen} disabled={!onOpen} sink="tile" accessibilityRole="button">
                <Box style={styles.badge} align="center" justify="center">
                    <Icon name="location" size={theme.icon.md} tint="lit" />
                </Box>

                <Text rank="action" numberOfLines={2} style={styles.place}>
                    {onOpen ? t("details.openMap") : place}
                </Text>

                {onOpen ? <Icon name={chevronNext} size={theme.icon.sm} tint="soft" /> : null}
            </Press>
        );

    }

    return (
        <Press style={styles.map} onPress={onOpen} disabled={!onOpen} sink="tile" accessibilityRole="button">
            <Still latitude={latitude} longitude={longitude} native={nativeMaps} />

            <Box style={styles.pin} align="center" justify="center">
                <Icon name="location" size={theme.icon.lg} tint="lit" />
            </Box>
        </Press>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    map: {
        aspectRatio: theme.ratio.wide,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: theme.radius.tile,
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "well"],
    },
    pin: {
        position: "absolute",
        width: theme.control.md.height,
        height: theme.control.md.height,
        borderRadius: theme.radius.pill,
        borderWidth: theme.stroke.base,
        borderColor: theme.plane.base,
        backgroundColor: theme.tone.brand.base,
        boxShadow: theme.depth.float.boxShadow,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        padding: theme.space["3"],
        borderRadius: theme.radius.control,
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "well"],
    },
    badge: {
        width: theme.control.md.height,
        height: theme.control.md.height,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.base,
    },
    place: {
        flex: 1,
    },

}));
