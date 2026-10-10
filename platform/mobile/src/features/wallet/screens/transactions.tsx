import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Group } from "@/components/group";
import { Section } from "@/components/section";
import { Loading } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import { Empty } from "@/elements/empty";
import { Screen } from "@/elements/screen";
import { type Tab as TabOption, Tabs } from "@/elements/tabs";
import { Feed, Filtered, Guest } from "@/features/shell";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { Entry } from "@/features/wallet/components/entry";
import { EntrySheet } from "@/features/wallet/components/entry-sheet";
import { LedgerRow } from "@/features/wallet/components/ledger";
import type { Transaction, TransactionState } from "@/model/wallet";
import { itemsOf } from "@/query/shelf";
import { useStatement, useTransactions } from "@/query/wallet";
import { byDay } from "@/std/number";
import { useSession } from "@/store/session";

type Tab = "all" | "done" | "pending" | "failed" | "ledger";

const buckets: Record<Tab, readonly TransactionState[]> = {
    all: [],
    done: [ "successful", "refunded" ],
    pending: [ "pending" ],
    failed: [ "failed", "cancelled" ],
    ledger: [],
};

export function TransactionsScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const when = useWhen();

    const [ tab, setTab ] = useState<Tab>("all");
    const [ held, setHeld ] = useState<Transaction | null>(null);
    const ledgered = tab === "ledger";
    const history = useTransactions();
    const ledger = useStatement(ledgered);

    const entries = itemsOf(history.data);

    const shown = useMemo<readonly Transaction[]>(() => {

        const states = buckets[tab];

        return states.length === 0 ? entries : entries.filter(( entry ) => states.includes(entry.state) );

    }, [ entries, tab ]);

    const segments: readonly TabOption<Tab>[] = [
        { key: "all", label: t("wallet.tabAll"), icon: "receipt" },
        { key: "done", label: t("wallet.tabDone"), icon: "checkCircle" },
        { key: "pending", label: t("wallet.tabPending"), icon: "clock" },
        { key: "failed", label: t("wallet.tabFailed"), icon: "alert" },
        { key: "ledger", label: t("wallet.tabStatement"), icon: "doc" },
    ];

    const days = useMemo(() => byDay(shown), [ shown ]);
    const pages = useMemo(() => byDay(itemsOf(ledger.data)), [ ledger.data ]);

    if ( !token ) return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("wallet.flow")} onBack={() => retreat() } />
            <Guest note={t("wallet.guestBody")} onLogin={() => router.push("/login") } />
        </Screen>
    );

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("wallet.flow")} onBack={() => retreat() }>
                <Tabs options={segments} active={tab} onPick={setTab} />
            </AppBar>

            {ledgered ? (
                <Feed
                    key="ledger"
                    list={ledger}
                    items={pages}
                    keyOf={( day ) => day.key }
                    render={( day ) => (
                        <Section title={day.at ? when.date(day.at) : t("wallet.tabStatement")}><Group staggered>
                            {day.items.map(( row ) => <LedgerRow key={row.id} entry={row} clock />)}
                        </Group></Section>
                    )}
                    loading={<Loading shape="rows" rows={4} />}
                    empty={<Empty emblem="receipt" title={t("wallet.statementEmptyTitle")} note={t("wallet.statementEmptyBody")} />}
                    gap="4"
                />
            ) : (
                <Feed
                    key={tab}
                    list={history}
                    items={days}
                    keyOf={( day ) => day.key }
                    render={( day ) => (
                        <Section title={day.at ? when.date(day.at) : t("wallet.tabStatement")}><Group staggered>
                            {day.items.map(( entry ) => <Entry key={entry.id} entry={entry} onPress={() => setHeld(entry) } />)}
                        </Group></Section>
                    )}
                    loading={<Loading shape="rows" rows={4} />}
                    empty={tab === "all" ? <Empty emblem="money" title={t("wallet.emptyTitle")} note={t("wallet.emptyBody")} /> : <Filtered emblem="money" filter={segments.find(( segment ) => segment.key === tab )?.label ?? ""} all={t("wallet.tabAll")} />}
                    gap="4"
                />
            )}

            <EntrySheet entry={held} onClose={() => setHeld(null) } />
        </Screen>
    );

}
