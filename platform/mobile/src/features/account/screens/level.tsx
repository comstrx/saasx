import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { Section } from "@/components/section";
import { Loading, Phased, phaseOf } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Empty } from "@/elements/empty";
import { usePull } from "@/elements/hooks/use-pull";
import type { IconName } from "@/elements/icon";
import { Progress } from "@/elements/progress";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { Ladder } from "@/features/account/components/ladder";
import { RankCard } from "@/features/account/components/rank-card";
import { Guest, Trouble } from "@/features/shell";
import { Intro } from "@/features/shell/components/intro";
import { concepts } from "@/features/shell/concepts";
import { useMoney } from "@/features/shell/hooks/use-money";
import { useNudge } from "@/features/shell/hooks/use-nudge";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { baseCurrency } from "@/model/currency";
import { type Condition, climbOf, type Perk, reachOf } from "@/model/level";
import { useAccount, useLevel, useRewards, useTiers } from "@/query/account";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

const perkMarks: Record<string, IconName> = {
    discount: "coupon",
    cashback: "wallet",
    points_multiplier: "star",
    free_delivery: "travel",
    priority_delivery: "travel",
    priority_support: "support",
    exclusive_access: "key",
    birthday_gift: "gift",
    free_cancellation: "shield",
};

const rewardMarks: Record<string, IconName> = {
    register: "user",
    referral: "users",
    referred: "users",
    level: "award",
    order: "orders",
    first_purchase: "gift",
    review: "star",
};

export function LevelScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const theme = useTheme();
    const cash = useMoney();
    const when = useWhen();

    const profile = useAccount();
    const standing = useLevel();
    const pull = usePull(standing.refetch);
    const earned = useRewards();
    const tiers = useTiers(Boolean(token));

    const me = profile.data;
    const level = standing.data;
    const climb = level?.progress ? Math.round(climbOf(level.progress) * 100) : 100;

    const next = tiers.data?.find(( tier ) => tier.rank === level?.progress?.rank )?.name;

    useNudge("level", token && level?.progress && climb < 100 ? t("nudge.level", { percent: climb, name: next ?? t("level.rank", { rank: level.progress.rank }) }) : null);
    const currency = me?.wallet?.currency ?? baseCurrency;

    const perkValue = ( perk: Perk ): string => {

        if ( perk.rate > 0 ) return t("level.perkRate", { rate: perk.rate });
        if ( perk.value.amount > 0 ) return cash.amount(perk.value.amount, perk.value.currency);

        return t("level.perkOn");

    };

    const conditionValue = ( condition: Condition ): string => condition.met
        ? t("level.conditionMet")
        : condition.money
        ? t("level.reachedMoney", {
            reached: cash.round(condition.reached, currency),
            required: cash.round(condition.required, currency),
        })
        : t("level.reached", { reached: Math.round(condition.reached), required: Math.round(condition.required) });

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("level.title")} onBack={() => retreat() } />

            <Scroll
                contentContainerStyle={styles.scroll}
                refreshing={pull.refreshing}
                onRefresh={pull.onRefresh}
            >
                {token ? (
                    <Phased
                        phase={phaseOf(standing.isPending && !level, standing.isError && !level, !standing.isPending && !level && ( tiers.data?.length ?? 0 ) === 0)}
                        loading={<Loading shape="card" rows={2} />}
                        failed={<Trouble reason={standing.error} onRetry={() => { void standing.refetch(); }} />}
                        empty={<Empty emblem="trophy" title={t("level.emptyTitle")} note={t("level.emptyBody")} action={t("level.start")} deed="search" onAction={() => router.push("/explore") } />}
                    >
                        {level ? <RankCard level={level} points={me?.wallet?.points ?? 0} next={next} /> : null}

                        {level?.progress && level.progress.conditions.length > 0 ? (
                            <Section title={t("level.climb")}>
                                <Box plane="base" depth="lift" curve="panel" pad="4" gap="4">
                                    <Box gap="2">
                                        <Box row align="center" justify="between">
                                            <Text rank="caption" ink="soft">{t("level.nextTier", { name: next ?? t("level.rank", { rank: level.progress.rank }) })}</Text>
                                            <Text rank="label" figures>{`${ climb }%`}</Text>
                                        </Box>

                                        <Progress value={climb / 100} height={theme.stroke.rail * 2} />
                                    </Box>

                                    {level.progress.conditions.map(( condition ) => (
                                        <Box key={condition.key} gap="2">
                                            <Box row align="center" justify="between" gap="3">
                                                <Text rank="body" numberOfLines={1} style={styles.shrink}>{t(`level.condition.${ condition.key }`, condition.key)}</Text>
                                                <Text rank="caption" ink={condition.met ? undefined : "soft"} tint={condition.met ? "success" : undefined}>{conditionValue(condition)}</Text>
                                            </Box>

                                            <Progress value={reachOf(condition)} tint={condition.met ? "success" : "brand"} height={theme.stroke.base * 3} />
                                        </Box>
                                    ))}
                                </Box>
                            </Section>
                        ) : null}

                        {level && level.perks.length > 0 ? (
                            <Section title={t("level.perksTitle")}>
                                <Group>
                                    {level.perks.map(( perk ) => (
                                        <Row
                                            key={perk.key}
                                            plated
                                            tone={concepts.level}
                                            icon={perkMarks[perk.key] ?? "award"}
                                            title={t(`level.perk.${ perk.key }`, perk.key)}
                                            note={perk.cap.amount > 0 ? t("level.perkCap", { cap: cash.round(perk.cap.amount, perk.cap.currency) }) : undefined}
                                            value={perkValue(perk)}
                                            valueRank="action"
                                        />
                                    ))}
                                </Group>
                            </Section>
                        ) : null}

                        {( tiers.data?.length ?? 0 ) > 0 ? (
                            <Section title={t("level.ladderTitle")} note={t("level.ladderBody")}>
                                <Box plane="base" depth="lift" curve="panel" pad="4">
                                    <Ladder tiers={tiers.data ?? []} rank={level?.rank ?? 0} />
                                </Box>
                            </Section>
                        ) : null}

                        <Section title={t("level.historyTitle")}>
                            <Phased
                                phase={phaseOf(earned.isPending && !earned.data, earned.isError && !earned.data, ( earned.data?.length ?? 0 ) === 0)}
                                loading={<Loading shape="rows" rows={2} />}
                                failed={<Trouble reason={earned.error} onRetry={() => { void earned.refetch(); }} />}
                                empty={<Text rank="caption" ink="soft">{t("level.historyEmpty")}</Text>}
                            >
                                <Group>
                                    {( earned.data ?? [] ).map(( reward ) => (
                                        <Row
                                            key={String(reward.id)}
                                            plated
                                            tone={concepts.coupons}
                                            icon={rewardMarks[reward.key] ?? "gift"}
                                            title={t(`level.reward.${ reward.key }`, reward.key)}
                                            note={when.date(reward.at)}
                                            value={reward.points > 0
                                                ? t("level.pointsValue", { points: Math.round(reward.points) })
                                                : cash.amount(reward.amount.amount, reward.amount.currency)}
                                            valueRank="action"
                                        />
                                    ))}
                                </Group>
                            </Phased>
                        </Section>
                    </Phased>
                ) : <Guest note={t("level.guestBody")} onLogin={() => router.push("/login") } />}
            </Scroll>

            <Intro
                page="level"
                emblem="trophy"
                tone="warning"
                title={t("intro.level.title")}
                line={t("intro.level.line")}
                dismiss={t("intro.dismiss")}
                hold={!token}
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    scroll: {
        gap: theme.layout.section,
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
    },
    shrink: {
        flexShrink: 1,
    },

}));
