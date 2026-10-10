import type { ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { arrowBack, Icon, type IconName } from "@/elements/icon";
import { useLabels } from "@/elements/labels";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type ChatHeadProps = {
    figure: ReactNode;
    title: string;
    status?: string | undefined;
    tint?: ToneName | undefined;
    more?: RefObject<View | null> | undefined;
    onBack: () => void;
    onTitle?: (() => void) | undefined;
    onMore?: (() => void) | undefined;
    children?: ReactNode | undefined;
};

function Pebble ({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {

    const theme = useTheme();

    return (
        <Press onPress={onPress} sink="disc" hitSlop={theme.hit.slop} accessibilityRole="button" accessibilityLabel={label} style={styles.pebble}>
            <Icon name={icon} size={theme.icon.lg} color={theme.ink.strong} />
        </Press>
    );

}

export function ChatHead ({ figure, title, status, tint, more, onBack, onTitle, onMore, children }: ChatHeadProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const labels = useLabels();

    return (
        <View style={styles.head}>
            <View style={styles.row}>
                <Pebble icon={arrowBack} label={labels.back ?? t("common.back")} onPress={onBack} />

                <Press onPress={onTitle} disabled={!onTitle} sink="tile" accessibilityRole="button" accessibilityLabel={title} style={styles.pill}>
                    {figure}

                    <View style={styles.copy}>
                        <Text rank="title" numberOfLines={1}>{title}</Text>
                        {status ? <Text rank="caption" ink={tint ? undefined : "soft"} color={tint ? theme.tone[tint].onSoft : undefined} numberOfLines={1}>{status}</Text> : null}
                    </View>
                </Press>

                {onMore ? (
                    <View ref={more} collapsable={false}>
                        <Pebble icon="more" label={t("common.more")} onPress={onMore} />
                    </View>
                ) : null}
            </View>

            {children}
        </View>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    head: {
        gap: theme.space["2"],
        paddingTop: runtime.insets.top + theme.space["1.5"],
        paddingHorizontal: theme.layout.gutter,
        paddingBottom: theme.space["2"],
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.composition.bubble.gap,
    },
    pebble: {
        width: theme.composition.bubble.head,
        height: theme.composition.bubble.head,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.chat.glass,
        alignItems: "center",
        justifyContent: "center",
        boxShadow: theme.cast.float,
    },
    pill: {
        flex: 1,
        minHeight: theme.composition.bubble.head,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["2.5"],
        paddingVertical: ( theme.composition.bubble.head - theme.composition.bubble.face ) / 2,
        paddingStart: ( theme.composition.bubble.head - theme.composition.bubble.face ) / 2,
        paddingEnd: theme.space["4"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.chat.glass,
        boxShadow: theme.cast.float,
    },
    copy: {
        flex: 1,
    },

}));
