import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { Section } from "@/components/section";
import { Stat } from "@/components/stat";
import { Loading, Phased, phaseOf } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import { Avatar } from "@/elements/avatar";
import { Box } from "@/elements/box";
import { Empty } from "@/elements/empty";
import { useShare } from "@/elements/hooks/use-share";
import type { IconName } from "@/elements/icon";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Text } from "@/elements/text";
import { InviteCard } from "@/features/referrals/components/invite-card";
import { Feed, Guest, Trouble } from "@/features/shell";
import { useMoney } from "@/features/shell/hooks/use-money";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { type Grant, granted, referralGrants } from "@/model/referral";
import { useAccount, useRewards } from "@/query/account";
import { useInvited, useProgramme } from "@/query/referrals";
import { itemsOf } from "@/query/shelf";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

const grantMarks: Record<string, IconName> = {
    point: "star",
    coupon: "coupon",
    cashback: "wallet",
    balance: "wallet",
};

export function ReferralsScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const theme = useTheme();
    const when = useWhen();
    const cash = useMoney();
    const share = useShare();

    const profile = useAccount();
    const earned = useRewards();
    const invited = useInvited();
    const programme = useProgramme();

    const me = profile.data;
    const referral = me?.referral;

    const points = useMemo(
        () => ( earned.data ?? [] )
            .filter(( reward ) => reward.key.includes("referr") )
            .reduce(( sum, reward ) => sum + reward.points, 0 ),
        [ earned.data ],
    );

    const grants = useMemo(() => referralGrants(programme.data ?? []).filter(granted), [ programme.data ]);

    const people = itemsOf(invited.data);
    const count = invited.data?.pages[0]?.total ?? 0;

    const worth = ( grant: Grant ): string => {

        if ( grant.points > 0 ) return t("level.pointsValue", { points: Math.round(grant.points) });
        if ( grant.rate > 0 ) return t("level.perkRate", { rate: grant.rate });
        if ( grant.amount.amount > 0 ) return cash.amount(grant.amount.amount, grant.amount.currency);

        return grant.couponCode;

    };

    const copy = async () => {

        if ( !referral ) return;

        await Clipboard.setStringAsync(referral.code);
        notify(t("referrals.copied"), "success");

    };

    const invite = () => {

        if ( !referral ) return;

        void share({
            title: t("referrals.shareTitle"),
            message: t("referrals.shareBody", { code: referral.code }),
            url: referral.link ?? undefined,
        });

    };

    const header = (
        <Box gap="6" style={styles.head}>

            <Phased
                phase={phaseOf(profile.isPending && !me, profile.isError && !me, !referral)}
                loading={<Loading shape="card" rows={1} />}
                failed={<Trouble reason={profile.error} onRetry={() => { void profile.refetch(); }} />}
            >
                {referral ? (
                    <InviteCard
                        code={referral.code}
                        title={t("referrals.heroTitle")}
                        body={t("referrals.heroBody")}
                        codeLabel={t("referrals.codeLabel")}
                        shareLabel={t("referrals.share")}
                        onCopy={copy}
                        onShare={invite}
                    />
                ) : null}
            </Phased>

            <Stat
                cells={[
                    { key: "invited", value: String(count), label: t("referrals.invited") },
                    { key: "earned", value: String(Math.round(points)), label: t("referrals.earned") },
                ]}
            />

            {grants.length > 0 ? (
                <Section title={t("referrals.rewardsTitle")}>
                    <Group>
                        {grants.map(( grant ) => (
                            <Row
                                key={String(grant.id)}
                                plated
                                tone="brand"
                                icon={grantMarks[grant.kind] ?? "gift"}
                                title={t(`referrals.grant.${ grant.key }`, t(`level.reward.${ grant.key }`, grant.key))}
                                note={grant.cap.amount > 0 ? t("level.perkCap", { cap: cash.round(grant.cap.amount, grant.cap.currency) }) : undefined}
                                value={worth(grant)}
                                valueRank="action"
                            />
                        ))}
                    </Group>
                </Section>
            ) : null}

            <Section title={t("referrals.listTitle")} note={t("referrals.listBody")} />
        </Box>
    );

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("referrals.title")} onBack={() => retreat() } />

            {token ? (
                <Feed
                    list={invited}
                    items={people}
                    keyOf={( person ) => String(person.id) }
                    header={header}
                    render={( person ) => (
                        <View style={styles.person}>
                            <Avatar name={person.name} source={person.image ?? undefined} size={theme.control.md.height} />

                            <View style={styles.copy}>
                                <Text rank="action" numberOfLines={1}>{person.name}</Text>
                                <Text rank="note" ink="faint">{when.date(person.at)}</Text>
                            </View>

                            <Text rank="caption" ink={person.active ? undefined : "faint"} tint={person.active ? "success" : undefined}>
                                {t(person.active ? "referrals.active" : "referrals.idle")}
                            </Text>
                        </View>
                    )}
                    loading={<Loading shape="rows" rows={2} />}
                    empty={(
                        <Box plane="base" curve="panel" pad="5">
                            <Empty emblem="megaphone" title={t("referrals.emptyTitle")} note={t("referrals.emptyBody")} fill={false} compact />
                        </Box>
                    )}
                />
            ) : <Guest onLogin={() => router.push("/login") } />}
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    head: {
        paddingBottom: theme.space["3"],
    },
    person: {
        ...theme.card,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        padding: theme.space["4"],
    },
    copy: {
        flex: 1,
        gap: theme.space["1"] / 2,
    },

}));
