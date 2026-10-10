import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Group } from "@/components/group";
import { ReportLink } from "@/components/report-link";
import { Section } from "@/components/section";
import { Stat } from "@/components/stat";
import { Loading, Phased, phaseOf } from "@/components/states";
import { type Deed, Wallet, WalletDeeds } from "@/components/wallet";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Callout } from "@/elements/callout";
import { Flow, Legend } from "@/elements/chart";
import { usePull } from "@/elements/hooks/use-pull";
import type { IconName } from "@/elements/icon";
import { Stagger } from "@/elements/motion";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { useReturn, useWalletSettling } from "@/features/checkout/hooks/use-payment";
import { Guest, Trouble } from "@/features/shell";
import { useReportCopy } from "@/features/shell/copy";
import { useMoney } from "@/features/shell/hooks/use-money";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { LedgerRow } from "@/features/wallet/components/ledger";
import { allows } from "@/model/account";
import { baseCurrency } from "@/model/currency";
import { type Balance, livelyStats, type StatKey, statOf } from "@/model/wallet";
import { useAccount } from "@/query/account";
import { useOpenTicket } from "@/query/tickets";
import { useBalance, useFlow } from "@/query/wallet";
import { formatNumber } from "@/std/number";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

const statOrder: readonly StatKey[] = [ "deposits", "withdraws", "transfers", "pays", "refunds", "cashback", "referrals" ];

const statTones: Record<StatKey, ToneName> = {
    deposits: "success",
    withdraws: "danger",
    transfers: "info",
    pays: "accent",
    refunds: "info",
    cashback: "success",
    referrals: "brand",
    fees: "neutral",
};

const statGlyphs: Record<StatKey, IconName> = {
    deposits: "deposit",
    withdraws: "withdraw",
    transfers: "transfer",
    pays: "cart",
    refunds: "refresh",
    cashback: "reward",
    referrals: "users",
    fees: "receipt",
};

export function WalletScreen () {

    const { t, i18n } = useTranslation();
    const reportCopy = useReportCopy();
    const language = i18n.language;
    const theme = useTheme();
    const token = useSession(( state ) => state.token );

    const account = useAccount().data;
    const canDeposit = allows(account, "allow_deposits");
    const canWithdraw = allows(account, "allow_withdraws");
    const canHistory = allows(account, "view_transactions");

    const [ hidden, setHidden ] = useState(false);

    const purse = useBalance();
    const awaiting = useWalletSettling();

    useReturn(() => { void purse.refetch(); }, awaiting);

    const balance = purse.data;
    const currency = balance?.currency ?? baseCurrency;
    const cash = useMoney();
    const when = useWhen();
    const money = ( value: number ) => cash.amount(value, currency);
    const veiled = ( value: number ) => hidden ? "••••" : money(value);
    const points = ( value: number ) => formatNumber(language, Math.round(value));
    const stats = livelyStats(balance, statOrder);

    const deeds: readonly Deed[] = [
        ...( canDeposit ? [ { key: "deposit", label: t("wallet.deposit"), icon: "deposit" as const, tone: "success" as const, onPress: () => router.push("/wallet/deposit") } ] : [] ),
        ...( canWithdraw ? [ { key: "withdraw", label: t("wallet.withdrawTab"), icon: "withdraw" as const, tone: "danger" as const, onPress: () => router.push("/wallet/withdraw") } ] : [] ),
        ...( allows(account, "allow_transfers") ? [ { key: "transfer", label: t("wallet.transfer"), icon: "transfer" as const, tone: "info" as const, onPress: () => router.push("/wallet/transfer") } ] : [] ),
        ...( canHistory ? [ { key: "history", label: t("wallet.ledger"), icon: "history" as const, onPress: () => router.push("/wallet/transactions") } ] : [] ),
    ];

    const span = 7;
    const flow = useFlow(span);
    const days = flow.data?.days ?? [];
    const marks = days.map(( day ) => ({ key: day.key, label: when.day(day.at) }) );
    const lanes = [
        { key: "deposit", tone: "success" as const, label: t("wallet.deposit"), values: days.map(( day ) => day.deposit ) },
        { key: "withdraw", tone: "danger" as const, label: t("wallet.withdrawTab"), values: days.map(( day ) => day.withdraw ) },
        { key: "transfer", tone: "info" as const, label: t("wallet.transfer"), values: days.map(( day ) => day.transfer ) },
    ];
    const recent = flow.data?.recent ?? [];
    const moved = lanes.map(( lane ) => ({ ...lane, total: lane.values.reduce(( sum, value ) => sum + value, 0 ) }) );

    const shares = [
        { key: "spendable", label: t("wallet.spendable"), value: veiled(balance?.spendable ?? 0) },
        { key: "cashable", label: t("wallet.cashable"), value: veiled(balance?.withdrawable ?? 0) },
        { key: "pending", label: t("wallet.pending"), value: veiled(balance?.pending ?? 0) },
    ];

    const pull = usePull(purse.refetch);
    const ticketing = useOpenTicket();

    const raise = ( reason: string, note: string ) => {

        ticketing.mutate({ title: t("wallet.reportTitle"), content: [ t(`details.reportReason.${ reason }`, reason), note ].filter(Boolean).join("\n\n") }, {
            onSuccess: ( ticket ) => {

                notify(t("wallet.reportSent"), "success");
                router.push(`/ticket/${ ticket.id }`);

            },
        });

    };

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("wallet.title")} onBack={() => retreat() } />

            <Scroll
                refreshing={pull.refreshing}
                onRefresh={token ? pull.onRefresh : undefined}
                contentContainerStyle={{
                    gap: theme.layout.section,
                    paddingHorizontal: theme.layout.gutter,
                    paddingTop: theme.space["2"],
                }}
            >
                {!token ? <Guest note={t("wallet.guestBody")} onLogin={() => router.push("/login") } /> : (
                    <Phased
                        phase={phaseOf(purse.isPending && !balance, purse.isError && !balance, false)}
                        loading={<Loading shape="rows" rows={3} />}
                        failed={<Trouble reason={purse.error} onRetry={pull.onRefresh} />}
                    >
                        <Stagger from="below">
                            <Box gap="3">
                                <Wallet
                                    label={t("wallet.available")}
                                    amount={balance?.available ?? 0}
                                    symbol={cash.symbol(currency)}
                                    hidden={hidden}
                                    toggleLabel={t(hidden ? "wallet.reveal" : "wallet.conceal")}
                                    onToggle={() => setHidden(( value ) => !value )}
                                    shares={shares}
                                />

                                <Stat
                                    cells={[
                                        { key: "points", label: t("wallet.pointsNow"), value: hidden ? "••••" : points(balance?.points ?? 0), onPress: () => router.push("/level") },
                                        { key: "earned", label: t("wallet.pointsEarned"), value: hidden ? "••••" : points(balance?.earnedPoints ?? 0) },
                                    ]}
                                />
                            </Box>

                            {deeds.length > 0 ? <WalletDeeds deeds={deeds} /> : null}

                            {stats.length > 0 || awaiting || moved.some(( lane ) => lane.total > 0 ) ? (
                                <Box gap="3">
                                    {stats.length > 0 ? (
                                        <Group>
                                            {stats.map(( key ) => (
                                                <Row key={key} plated tone={statTones[key]} icon={statGlyphs[key]} title={t(`wallet.${ key }`)} value={veiled(statOf(balance as Balance, key))} valueRank="action" />
                                            ))}
                                        </Group>
                                    ) : null}

                                    {awaiting ? <Callout body={t("wallet.settlingBody")} tint="info" icon="clock" /> : null}

                                    {moved.some(( lane ) => lane.total > 0 ) ? (
                                        <Box plane="base" depth="lift" curve="panel" pad="4" gap="4">
                                            <Flow marks={marks} traces={lanes} />

                                            <Box gap="2">
                                                {moved.map(( lane ) => (
                                                    <Legend key={lane.key} tone={lane.tone} label={lane.label} value={veiled(lane.total)} />
                                                ))}
                                            </Box>
                                        </Box>
                                    ) : null}
                                </Box>
                            ) : null}

                            {canHistory ? (
                                <Section title={t("wallet.recent")} action={recent.length > 0 ? t("common.seeAll") : undefined} onAction={() => router.push("/wallet/transactions") }>
                                    {recent.length > 0 ? (
                                        <Group>{recent.map(( entry ) => <LedgerRow key={entry.id} entry={entry} /> )}</Group>
                                    ) : (
                                        <Box plane="base" depth="lift" curve="panel" pad="5" gap="1" align="center">
                                            <Text rank="action" align="center">{t("wallet.recentEmpty")}</Text>
                                            <Text rank="caption" ink="soft" align="center">{t("wallet.recentEmptyBody")}</Text>
                                        </Box>
                                    )}
                                </Section>
                            ) : null}

                            <ReportLink
                                {...reportCopy}
                                label={t("wallet.report")}
                                title={t("wallet.reportTitle")}
                                body={t("wallet.reportBody")}
                                busy={ticketing.isPending}
                                onSubmit={raise}
                            />
                        </Stagger>
                    </Phased>
                )}
            </Scroll>

        </Screen>
    );

}
