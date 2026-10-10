import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { Row } from "@/elements/row";
import { Door } from "@/features/legal/components/door";
import { concepts } from "@/features/shell/concepts";
import { allows } from "@/model/account";
import { useAccount } from "@/query/account";
import { useSession } from "@/store/session";

const desk = () => router.push({ pathname: "/chat", params: { desk: String(Date.now()) } });

export function HelpDoors () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );

    return (
        <View style={styles.pair}>
            <Door emblem="chat" title={t("legal.help.chat")} note={token ? t("account.supportNote") : t("legal.help.chatGuest")} onPress={() => token ? desk() : router.push("/login") } />
            <Door emblem="phone" title={t("contact.title")} note={t("account.contactNote")} onPress={() => router.push("/contact") } />
        </View>
    );

}

export function HelpRows () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const account = useAccount().data;

    return (
        <Group>
            {token && account && allows(account, "view_tickets") ? <Row key="tickets" plated tone={concepts.tickets} icon="support" title={t("tickets.title")} note={t("account.ticketsNote")} onPress={() => router.push("/tickets") } /> : null}
            {token
                ? <Row key="account" plated tone={concepts.personal} icon="user" title={t("legal.help.account")} note={t("legal.help.accountNote")} onPress={() => router.navigate("/account") } />
                : <Row key="login" plated tone={concepts.personal} icon="key" title={t("auth.login")} note={t("legal.help.loginNote")} onPress={() => router.push("/login") } />}
            <Row key="settings" plated tone={concepts.settings} icon="settings" title={t("account.settings")} note={t("account.settingsNote")} onPress={() => router.push("/settings") } />
        </Group>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    pair: {
        flexDirection: "row",
        gap: theme.layout.stack,
    },

}));
