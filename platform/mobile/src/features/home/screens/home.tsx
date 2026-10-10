import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Band } from "@/components/band";
import { Discovery } from "@/components/discovery";
import { Reward } from "@/components/reward";
import { Empty } from "@/elements/empty";
import { SearchLauncher } from "@/features/explore/components/launcher";
import { useHome } from "@/features/home/hooks/use-home";
import { OrderCard } from "@/features/orders/components/order-card";
import { Trouble } from "@/features/shell";
import { Intro } from "@/features/shell/components/intro";
import { useWhen } from "@/features/shell/hooks/use-when";
import { useTheme } from "@/theme/use-theme";

export function HomeScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const when = useWhen();
    const home = useHome();
    const [ searching, setSearching ] = useState(false);
    const upcoming = home.upcoming;

    return (
        <Discovery
            {...home.view}
            search={{ ...home.view.search, onPress: () => setSearching(true) }}
            lead={upcoming ? (
                <View style={{ gap: theme.composition.discovery.band }}>
                    <Band minor title={t("home.upcomingTitle")} action={t("common.seeAll")} onAction={() => router.push("/orders") } />
                    <OrderCard order={upcoming} at={when.date(upcoming.at)} onPress={() => router.push(`/order/${ upcoming.id }`) } />
                </View>
            ) : undefined}
            feedback={home.broken ? <Trouble reason={home.error} onRetry={home.refresh} /> : home.bare ? (
                <Empty emblem="search" title={t("home.emptyTitle", { type: home.label })} note={t("home.emptyBody")} action={t("home.emptyAction")} onAction={home.openExplore} />
            ) : null}
        >
            <Intro page="home" emblem="suitcase" title={t("intro.home.title")} line={t("intro.home.line")} action={t("intro.home.action")} dismiss={t("intro.dismiss")} hold={home.view.settling || home.rewards.active} onAction={home.openExplore} />
            {home.rewards.reward ? <Reward {...home.rewards.reward} /> : null}

            <SearchLauncher open={searching} kinds={home.kinds} type={home.type} ranged={home.ranged} onClose={() => setSearching(false) } />
        </Discovery>
    );

}
