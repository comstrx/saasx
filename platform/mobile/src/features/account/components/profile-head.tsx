import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Avatar } from "@/elements/avatar";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import type { Account } from "@/model/account";
import { isolateLtr } from "@/std/bidi";
import { useTheme } from "@/theme/use-theme";

type ProfileHeadProps = {
    account: Account;
};

export function ProfileHead ({ account }: ProfileHeadProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const crest = theme.composition.crest;
    const reach = account.phone ? isolateLtr(account.phone) : "";

    return (
        <View style={styles.head}>
            <Press onPress={() => router.push("/personal") } feel="dim" accessibilityRole="button" accessibilityLabel={t("account.photo")}>
                <Avatar name={account.name} source={account.image ?? undefined} size={crest.avatar} />

                <View style={styles.badge}>
                    <Icon name="camera" size={theme.icon.sm} color={theme.tone.brand.on} fill />
                </View>
            </Press>

            <View style={styles.words}>
                <Text rank="display" align="center" numberOfLines={1}>{account.name}</Text>
                {reach ? <Text rank="body" ink="soft" align="center" numberOfLines={1}>{reach}</Text> : null}
            </View>
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    head: {
        alignItems: "center",
        gap: theme.space["3"],
        paddingTop: theme.space["2"],
        paddingBottom: theme.space["2"],
    },
    badge: {
        position: "absolute",
        bottom: 0,
        insetInlineEnd: 0,
        width: theme.composition.crest.badge,
        height: theme.composition.crest.badge,
        borderRadius: theme.radius.pill,
        borderWidth: theme.stroke.base * 2,
        borderColor: theme.plane.canvas,
        backgroundColor: theme.tone.brand.bright,
        alignItems: "center",
        justifyContent: "center",
    },
    words: {
        alignSelf: "stretch",
        gap: theme.space["1"],
        paddingHorizontal: theme.layout.gutter,
    },

}));
