import { View } from "react-native";
import Animated, { css, useReducedMotion } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { Avatar } from "@/elements/avatar";
import { Icon } from "@/elements/icon";
import { glides } from "@/elements/motion";
import { Text } from "@/elements/text";
import type { Recipient } from "@/model/wallet";
import { beats } from "@/theme/motion";
import { useTheme } from "@/theme/use-theme";

const rising = css.keyframes({
    from: { opacity: 0, transform: [ { translateY: beats.rise } ] },
    to: { opacity: 1, transform: [ { translateY: 0 } ] },
});

type RecipientCardProps = {
    recipient: Recipient | undefined;
    label: string;
};

export function RecipientCard ({ recipient, label }: RecipientCardProps) {

    const theme = useTheme();
    const still = useReducedMotion();

    if ( !recipient ) return null;

    return (
        <Animated.View style={[ styles.card, still ? null : { animationName: rising, animationDuration: glides.enter.duration, animationTimingFunction: glides.enter.easing } ]}>
            <Avatar name={recipient.name} size={theme.control.lg.height} ring />

            <View style={styles.copy}>
                <Text rank="caption" ink="soft">{label}</Text>
                <Text rank="title" numberOfLines={1}>{recipient.name}</Text>
            </View>

            <View style={styles.seal}>
                <Icon name="checkCircle" size={theme.icon.lg} tint="success" />
            </View>
        </Animated.View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        ...theme.depth.flat,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
        padding: theme.space["3"],
        borderRadius: theme.radius.card,
        backgroundColor: theme.tone.brand.soft,
    },
    copy: {
        flex: 1,
        gap: theme.space["1"],
    },
    seal: {
        alignItems: "center",
        justifyContent: "center",
    },

}));
