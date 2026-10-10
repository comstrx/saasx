import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { AppBar } from "@/elements/app-bar";
import { Empty } from "@/elements/empty";
import { Screen } from "@/elements/screen";
import { retreat } from "@/features/shell/retreat";

export default function NotFound () {

    const { t } = useTranslation();

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("lost.title")} onBack={() => retreat() } />

            <Empty
                emblem="lost"
                title={t("lost.emptyTitle")}
                note={t("lost.emptyBody")}
                action={t("thanks.home")}
                onAction={() => router.replace("/") }
            />
        </Screen>
    );

}
