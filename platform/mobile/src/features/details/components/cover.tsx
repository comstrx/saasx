import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { Gallery } from "@/components/gallery";
import type { Frame } from "@/elements/flight";
import type { IconName } from "@/elements/icon";
import type { Shot } from "@/model/detail";
import { ratio } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";
import { shade } from "@/theme/wash";

export const coverRatio = ratio.detail;

type CoverProps = {
    shots: readonly Shot[];
    icon: IconName;
    glide?: SharedValue<number> | undefined;
    settled?: boolean | undefined;
    onOpen: () => void;
    onReady?: (() => void) | undefined;
};

export const coverFrame = ( width: number ): Frame => ({ x: 0, y: 0, w: width, h: Math.round(width * coverRatio), r: 0 });

export function Cover ({ shots, icon, glide, settled = false, onOpen, onReady }: CoverProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const viewport = useWindowDimensions();

    return (
        <View>
            <Gallery
                shots={shots.map(( shot ) => shot.picture )}
                height={Math.round(viewport.width * coverRatio)}
                icon={icon}
                track={glide}
                overlap={theme.space["7"]}
                label={t("details.galleryTitle")}
                settled={settled}
                onOpen={onOpen}
                onReady={onReady}
            />

            <View pointerEvents="none" style={styles.scrim} />
        </View>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    scrim: {
        position: "absolute",
        insetInlineStart: 0,
        insetInlineEnd: 0,
        top: 0,
        height: runtime.insets.top + theme.control.md.height + theme.space["6"],
        experimental_backgroundImage: shade(theme.material.ink, theme.material.veils.hero),
    },

}));
