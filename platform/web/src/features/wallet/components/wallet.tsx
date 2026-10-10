"use client";

import FormRetry from "@/components/form-retry";
import MoneyList from "@/components/money-list";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import TransactionDialog from "@/components/transaction-dialog";
import WalletActions from "@/components/wallet-actions";
import WalletDeposit from "@/components/wallet-deposit";
import WalletOverview from "@/components/wallet-overview";
import WalletTabs from "@/components/wallet-tabs";
import WalletTransfer from "@/components/wallet-transfer";
import WalletWithdraw from "@/components/wallet-withdraw";
import { useTranslations } from "@/lib/providers/intl";
import { useWallet } from "../hooks/use-wallet";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: { login: string; art: string; empty: string };
};

export default function Wallet ({ title, description, icon, tone, links }: Props) {

    const state = useWallet(links.login);
    const { t } = state;
    const common = useTranslations("common");
    const currencyLabel = state.currency;

    if ( !state.ready ) return <SectionSkeleton />;

    if ( !state.token ) return (

        <SignInPrompt
            level={1} title={title} description={t("signInBody")} href={state.login} label={t("signIn")} art={links.art}
        />

    );

    return (

        <SettingsLayout title={title} description={description} icon={icon} tone={tone}>

            {state.failed ? <FormRetry id="wallet-failure" message={t("unavailable")} label={common("retry")} onRetry={state.reload} />
                : state.loading || !state.balance ? <SectionSkeleton /> : (

                    <WalletOverview
                        currencyLabel={currencyLabel} balance={state.balance} stats={state.stats} holder={state.holder}
                        labels={{
                            available: t("available"), pending: t("pending"), total: t("total"), points: t("pointsLabel"),
                            card: t("cardBrand"), stats: t("statsLabel"), manage: t("manage"), manageBody: t("manageBody"),
                        }}
                        actions={<WalletActions labels={{ add: t("add"), send: t("send"), withdraw: t("withdraw") }} onOpen={state.show} />}
                    />

                )}

            <WalletTabs tabs={state.tabs} current={state.view} label={t("listTitle")} more={state.more} moreLabel={t("more")}>

                {state.listFailed ? (

                    <FormRetry id="wallet-list-failure" message={t("unavailable")} label={common("retry")} onRetry={state.reload} />

                )
                    : state.listLoading ? <SectionSkeleton />
                    : state.view === "statement" ? state.statement.length
                        ? <MoneyList label={t("tabs.statement")} items={state.statement} currencyLabel={currencyLabel} />
                        : <StateNotice art={links.empty} title={t("emptyTitle")} description={t("emptyBody")} />
                    : state.transactions.length ? (

                        <MoneyList
                            label={t("tabs.transactions")} items={state.transactions} currencyLabel={currencyLabel} open={t("details")}
                            onOpen={( key ) => state.setOpened(state.transactions.find(( item ) => item.key === key)?.row ?? null)}
                            selection={{
                                ids: state.trash.selection.ids, label: state.trash.selection.labels.select,
                                onPick: state.trash.selection.pick,
                            }}
                            bulk={state.trash.selection.ids.length ? {
                                count: state.trash.selection.labels.count, clear: state.trash.selection.labels.clear,
                                busy: state.trash.pending, onClear: state.trash.selection.clear,
                                actions: [{
                                    key: "remove", label: state.trash.selection.labels.remove, icon: "eye-off", danger: true,
                                    onSelect: () => { void state.trash.hideSelected(); },
                                }],
                            } : null}
                        />

                    ) : <StateNotice art={links.empty} title={t("transactionsEmpty")} description={t("transactionsBody")} />}

            </WalletTabs>

            <WalletDeposit
                open={state.dialog === "deposit"} currency={state.currency} close={t("close")} onOpenChange={state.toggle("deposit")}
            />

            <WalletTransfer
                open={state.dialog === "transfer"} currency={state.currency} close={t("close")} onOpenChange={state.toggle("transfer")}
                onDone={state.reload}
            />

            <WalletWithdraw
                open={state.dialog === "withdraw"} currency={state.currency} close={t("close")} onOpenChange={state.toggle("withdraw")}
                onDone={state.reload}
            />

            <TransactionDialog
                transactionId={state.opened?.id ?? null} close={t("close")} retry={common("retry")}
                onClose={() => state.setOpened(null)} onChanged={state.reload}
                onHide={( id ) => { void state.trash.hide(id).then(( done ) => { if ( done ) state.setOpened(null); }); }}
            />

        </SettingsLayout>

    );

}
