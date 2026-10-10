import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { ReportLink } from "@/components/report-link";
import { Loading } from "@/components/states";
import { SummaryBar } from "@/components/summary";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Empty } from "@/elements/empty";
import { usePull } from "@/elements/hooks/use-pull";
import { Stagger } from "@/elements/motion";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { glyphOf } from "@/features/catalog/marks";
import { ApplicantsSheet } from "@/features/checkout/components/applicants-sheet";
import { CartLineRow } from "@/features/checkout/components/cart-line";
import { DateRangeSheet } from "@/features/checkout/components/date-range-sheet";
import { GuestSheet } from "@/features/checkout/components/guest-sheet";
import { usePriceLines } from "@/features/checkout/components/ledger";
import { PaySheet } from "@/features/checkout/components/pay-sheet";
import { useBasketController } from "@/features/checkout/hooks/use-basket";
import { Guest, Trouble } from "@/features/shell";
import { Intro } from "@/features/shell/components/intro";
import { useConfirmCopy, useReportCopy } from "@/features/shell/copy";
import { useConfirm } from "@/features/shell/hooks/use-confirm";
import { useMoney } from "@/features/shell/hooks/use-money";
import { useNudge } from "@/features/shell/hooks/use-nudge";
import { retreat } from "@/features/shell/retreat";
import { allows } from "@/model/account";
import { availabilityHorizon, spanOpen } from "@/model/availability";
import { basketOf, type CartSettlement, countOf, emptyBasket, indicative, sumOf } from "@/model/cart";
import { facing, pooled } from "@/model/order";
import { covers } from "@/model/wallet";
import { useAccount } from "@/query/account";
import { useCart, useCartDrop, useCartQuantity, useCartSettle } from "@/query/cart";
import { useAvailability } from "@/query/catalogs";
import { useLimits, useNeeds, useRanged } from "@/query/contract";
import { useQuotes } from "@/query/orders";
import { useOpenTicket } from "@/query/tickets";
import { useBalance } from "@/query/wallet";
import { addIsoDays, todayIso } from "@/std/date-range";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";

export function CartScreen () {

    const { t } = useTranslation();
    const confirmCopy = useConfirmCopy();
    const reportCopy = useReportCopy();
    const cash = useMoney();
    const token = useSession(( state ) => state.token );

    const held = useCart();
    const pull = usePull(held.refetch);
    const quantity = useCartQuantity();
    const drop = useCartDrop();
    const settle = useCartSettle();
    const purse = useBalance().data;
    const account = useAccount().data;
    const limits = useLimits();

    const basket = held.data ?? emptyBasket;
    const lines = basket.lines;

    useNudge("cart", token && lines.length > 0 ? t("nudge.cart", { count: countOf(lines) }) : null);
    const flow = useBasketController(lines);
    const needsOf = useNeeds();
    const priceLines = usePriceLines();
    const rangedOf = useRanged();
    const spanned = flow.edit ? rangedOf(flow.edit.line.listing.capabilities) : true;
    const opening = todayIso();
    const slots = useAvailability(flow.edit?.line.listing.id ?? 0, opening, addIsoDays(opening, limits.data?.horizonDays ?? availabilityHorizon), flow.edit?.need === "dates");
    const openDays = slots.data;

    const [ paying, setPaying ] = useState(false);
    const report = useOpenTicket();

    const whole = lines.length > 0 && flow.chosen.length === lines.length;
    const covered = flow.edit?.line.listing.capabilities.includes("underwritten") ?? false;
    const due = whole && basket.subtotal ? basket.subtotal : sumOf(flow.chosen);
    const dark = flow.chosen.length > 0 && due === null;
    const rough = due !== null && flow.chosen.some(indicative);
    const busy = quantity.isPending || drop.isPending || settle.isPending || flow.busy;
    const quotes = useQuotes(flow.chosen.map(basketOf), paying);
    const pool = pooled(quotes.map(( quote ) => quote.data ? facing(quote.data) : null ));
    const quoting = paying && quotes.some(( quote ) => quote.isLoading );
    const quoted = pool?.total ?? null;
    const charge = quoted ?? due;
    const homeless = flow.chosen.some(( line ) => line.shipped ) && !account?.location?.address;
    const walletAllowed = allows(account, "view_wallets");
    const walletEnough = covers(purse, charge);
    const walletNote = !purse ? "" : walletEnough ? t("checkout.walletNote", { amount: cash.amount(purse.spendable, purse.currency) }) : t("checkout.walletShort");

    const raise = ( reason: string, note: string ) => {

        const body = lines
            .map(( line ) => `#${ line.listing.id } ${ line.listing.name } ×${ line.quantity }` )
            .join("\n");

        report.mutate({ title: t("cart.reportTitle"), content: [ t(`details.reportReason.${ reason }`, reason), note, body ].filter(Boolean).join("\n\n") }, {
            onSuccess: ( ticket ) => {

                notify(t("cart.reportSent"), "success");
                router.push(`/ticket/${ ticket.id }`);

            },
        });

    };

    const landed = ( result: CartSettlement ) => {

        const first = result.orders[0];

        setPaying(false);
        notify(result.failed.length > 0
            ? t("cart.settledSome", { count: result.orders.length })
            : t("cart.settled", { count: result.orders.length }), result.failed.length > 0 ? "info" : "success");

        if ( first && first.id > 0 ) router.push({ pathname: "/thanks", params: { order: String(first.id), more: String(result.orders.length - 1) } });
        else router.push("/orders");

    };

    const settling = useConfirm(landed);

    const place = ( pay: "wallet" | "later" ) => {

        void settling.run("cart-checkout", ( attempt, code ) => settle.mutateAsync({
            lines: flow.chosen.map(( line ) => line.id ),
            pay,
            attempt,
            code,
        }));

    };

    const pay = () => {

        const first = flow.blocked[0];

        if ( first ) { flow.open(first); return; }

        if ( homeless ) { router.push("/personal"); return; }

        if ( flow.chosen.length === 1 ) {

            const line = flow.chosen[0];

            if ( line ) router.push({ pathname: "/checkout", params: flow.paramsOf(line) });

            return;

        }

        setPaying(true);

    };

    if ( !token ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar title={t("cart.title")} onBack={() => retreat() } />

                <Guest note={t("cart.signInBody")} onLogin={() => router.push("/login") } />
            </Screen>
        );

    }

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("cart.title")} onBack={() => retreat() } />

            <Scroll
                docked={lines.length > 0}
                bare={lines.length === 0}
                contentContainerStyle={styles.scroll}
                refreshing={pull.refreshing}
                onRefresh={pull.onRefresh}
            >
                {held.isError && !held.data
                    ? <Trouble reason={held.error} onRetry={() => { void held.refetch(); }} />
                    : held.isPending && !held.data
                    ? <Box style={styles.inset}><Loading shape="rows" rows={5} /></Box>
                    : lines.length === 0 && !held.isPending
                    ? (
                        <Empty
                            emblem="bag"
                            title={t("cart.emptyTitle")}
                            note={t("cart.emptyBody")}
                            action={t("cart.browse")}
                            onAction={() => router.replace("/") }
                        />
                    )
                    : (
                        <Stagger leave>
                            {lines.map(( line ) => (
                                <CartLineRow
                                    key={line.id}
                                    line={line}
                                    icon={glyphOf(line.listing.type)}
                                    need={needsOf(line.listing.capabilities)[0]}
                                    busy={busy}
                                    ready={flow.readyOf(line)}
                                    picked={flow.picked(line)}
                                    summary={flow.summaryOf(line)}
                                    onPick={() => flow.pick(line) }
                                    onOpen={() => router.push(`/catalog/${ line.listing.id }`) }
                                    onEdit={needsOf(line.listing.capabilities).length > 0 ? () => flow.open(line) : undefined}
                                    onQuantity={( next ) => quantity.mutate({ id: line.id, from: line.quantity, to: next }) }
                                    onRemove={() => drop.mutate({ line: line.id, catalog: line.listing.id }) }
                                />
                            ))}

                            <Text key="rule" rank="caption" ink="soft" style={styles.rule}>{t("cart.rule")}</Text>

                            <ReportLink
                                {...reportCopy}
                                key="report"
                                label={t("cart.report")}
                                title={t("cart.reportTitle")}
                                body={t("cart.reportBody")}
                                busy={report.isPending}
                                onSubmit={raise}
                            />
                        </Stagger>
                    )}
            </Scroll>

            {lines.length > 0 ? (
                <SummaryBar
                    action={flow.blocked.length > 0 ? t("cart.completeFacts") : homeless ? t("checkout.needAddress") : t("cart.checkout")}
                    caption={t("cart.lines", { count: flow.chosen.length })}
                    amount={due ? cash.amount(due.amount, due.currency) : undefined}
                    note={flow.blocked.length > 0 ? t("cart.blocked", { count: flow.blocked.length }) : dark ? t("cart.noPriceHint") : rough ? t("cart.estimated") : undefined}
                    tint={flow.blocked.length > 0 || homeless || dark ? "warning" : undefined}
                    busy={busy}
                    disabled={flow.chosen.length === 0}
                    onAction={pay}
                />
            ) : null}

            <Intro
                page="cart"
                emblem="bag"
                tone="accent"
                title={t("intro.cart.title")}
                line={t("intro.cart.line")}
                dismiss={t("intro.dismiss")}
                hold={lines.length === 0}
            />

            <PaySheet
                open={paying}
                amount={charge ? cash.amount(charge.amount, charge.currency) : ""}
                ledger={pool ? { lines: priceLines(pool.lines), total: cash.amount(pool.total.amount, pool.total.currency) } : undefined}
                wallet={{ allowed: walletAllowed, enough: walletEnough, note: walletNote }}
                later={flow.chosen.every(( line ) => line.payLater )}
                estimated={!quoted && !quoting}
                quoting={quoting}
                busy={settling.busy}
                onPay={( choice ) => place(choice.kind === "later" ? "later" : "wallet") }
                onTopUp={() => { setPaying(false); router.push("/wallet/deposit"); }}
                onClose={() => setPaying(false) }
            />

            <ConfirmSheet
                copy={confirmCopy}
                open={settling.asking}
                busy={settling.busy}
                wrong={settling.wrong}
                challenge={settling.challenge}
                note={t("confirm.checkoutBody", { amount: charge ? cash.amount(charge.amount, charge.currency) : "" })}
                onSubmit={( code ) => { void settling.answer(code); }}
                onResend={() => { void settling.resend(); }}
                onClose={settling.dismiss}
            />

            <DateRangeSheet
                open={flow.edit?.need === "dates"}
                ahead={limits.data?.aheadDays}
                value={{ start: flow.draft?.startsAt ?? null, end: flow.draft?.endsAt ?? null }}
                single={!spanned}
                valid={Boolean(flow.draft?.startsAt) && ( !spanned || Boolean(flow.draft?.endsAt) ) && ( !openDays || spanOpen(openDays, flow.draft?.startsAt ?? null, flow.draft?.endsAt ?? null) )}
                availability={openDays}
                onSelect={flow.chooseDate}
                onClear={flow.clearDates}
                onSave={flow.save}
                onClose={flow.close}
            />

            <ApplicantsSheet
                open={flow.edit?.need === "applicants"}
                applicants={flow.draft?.applicants ?? []}
                title={covered ? undefined : t("checkout.travellers")}
                body={covered ? undefined : t("checkout.travellersBody")}
                onAdd={flow.addApplicant}
                onDrop={flow.dropApplicant}
                onEdit={flow.editApplicant}
                onSave={flow.save}
                onClose={flow.close}
            />

            <GuestSheet
                open={flow.edit?.need === "guests"}
                value={flow.guests ?? { adults: 1, children: 0, infants: 0, pets: 0 }}
                capacity={flow.edit?.line.listing.capacity ?? 0}
                valid={( flow.guests?.adults ?? 0 ) >= 1}
                onChange={flow.changeGuest}
                onSave={flow.save}
                onClose={flow.close}
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    scroll: {
        flexGrow: 1,
        gap: theme.layout.stack,
    },
    inset: {
        paddingHorizontal: theme.layout.gutter,
    },
    rule: {
        paddingHorizontal: theme.layout.gutter + theme.composition.group.notePad,
    },

}));
