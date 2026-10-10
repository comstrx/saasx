import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Loading } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import { Screen } from "@/elements/screen";
import { Guest, Trouble } from "@/features/shell";
import { retreat } from "@/features/shell/retreat";
import { useSession } from "@/store/session";

type AwaitingProps = {
    title: string;
    read: { isError: boolean; error: unknown; refetch: () => unknown };
};

export function Awaiting ({ title, read }: AwaitingProps) {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={title} onBack={() => retreat() } />

            {!token
                ? <Guest note={t("wallet.guestBody")} onLogin={() => router.push("/login") } />
                : read.isError
                    ? <Trouble reason={read.error} onRetry={() => { void read.refetch(); }} />
                    : <View style={styles.inset}><Loading shape="rows" rows={3} /></View>}
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    inset: {
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
    },

}));
