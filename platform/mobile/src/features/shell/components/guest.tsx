import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Art } from "@/elements/art";
import { Button } from "@/elements/button";
import { Empty } from "@/elements/empty";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type GuestProps = {
    note?: string | undefined;
    look?: "empty" | "card" | undefined;
    onLogin: () => void;
};

export function Guest ({ note, look = "empty", onLogin }: GuestProps) {

    const { t } = useTranslation();
    const theme = useTheme();

    const title = t("account.guestTitle");
    const body = note ?? t("account.guestBody");

    if ( look === "card" ) {

        return (
            <View style={styles.card}>
                <View style={styles.head}>
                    <View style={styles.copy}>
                        <Text rank="title" numberOfLines={2}>{title}</Text>
                        <Text rank="caption" ink="faint">{body}</Text>
                    </View>

                    <Art name="login" size={theme.art.sm} fit="contain" />
                </View>

                <Button label={t("auth.login")} onPress={onLogin} />
            </View>
        );

    }

    return <Scroll bare><Empty art="enter" title={title} note={body} action={t("auth.login")} deed="user" onAction={onLogin} /></Scroll>;

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        ...theme.card,
        gap: theme.space["4"],
        padding: theme.space["5"],
    },
    head: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
    },
    copy: {
        flex: 1,
        gap: theme.space["1"],
    },

}));
