import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ComposeSheet } from "@/components/compose-sheet";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { Order } from "@/components/order";
import { Alert } from "@/elements/alert";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Empty } from "@/elements/empty";
import { Stagger } from "@/elements/motion";
import { Rating } from "@/elements/rating";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { glyphOf } from "@/features/catalog/marks";
import { type PayChoice, PaySheet } from "@/features/checkout/components/pay-sheet";
import { settlePayment, useReturn, useSettling } from "@/features/checkout/hooks/use-payment";
import { Skeleton } from "@/features/details/components/skeleton";
import { useOrderFacts } from "@/features/orders/components/facts";
import { Journey } from "@/features/orders/components/journey";
import { Guest, Trouble } from "@/features/shell";
import { useConfirmCopy, usePartyText } from "@/features/shell/copy";
import { useConfirm } from "@/features/shell/hooks/use-confirm";
import { useMethod } from "@/features/shell/hooks/use-method";
import { useMoney } from "@/features/shell/hooks/use-money";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { allows } from "@/model/account";
import { cancelOutcomeOf, dead, journeyLive, refundableLegs, settled } from "@/model/order";
import type { PaymentIntent, PaymentTarget } from "@/model/payment";
import { covers, railsFor } from "@/model/wallet";
import { useAccount } from "@/query/account";
import { useOpenChat } from "@/query/chat";
import { useDeal } from "@/query/contract";
import { useCancelOrder, useOrder, useOrderReviews, usePayOrder, useReviewOrder } from "@/query/orders";
import { useOpenTicket } from "@/query/tickets";
import { useBalance, useRails, useRefund } from "@/query/wallet";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";
import type { ToneName } from "@/theme/roles";

export function OrderScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const confirmCopy = useConfirmCopy();
    const when = useWhen();
    const params = useLocalSearchParams<{ id?: string }>();

    const id = Number(params.id ?? 0);
    const target = useMemo<PaymentTarget>(() => ({ kind: "order", id }), [ id ]);
    const awaiting = useSettling(target);
    const order = useOrder(id, awaiting);
    const data = order.data;
    const facts = useOrderFacts(data);
    const deal = useDeal(data?.type ?? "");

    useReturn(() => { void order.refetch(); }, awaiting);

    const cash = useMoney();
    const money = cash.amount;
    const party = usePartyText();

    const stamp = when.moment;

    const guests = party(data?.adults ?? 0, data?.children ?? 0);

    const [ panel, setPanel ] = useState<"review" | "ticket" | null>(null);

    const reviewing = useReviewOrder(id);
    const reviews = useOrderReviews(id, Boolean(data) && !data?.canReview);
    const mine = reviews.data?.[0] ?? null;
    const ticketing = useOpenTicket();

    const [ pending, setPending ] = useState<"cancel" | "refund" | null>(null);
    const [ leg, setLeg ] = useState(0);
    const [ paying, setPaying ] = useState(false);
    const purse = useBalance().data;
    const account = useAccount().data;
    const rails = useRails(true);
    const method = useMethod();
    const gateways = useMemo(() => railsFor(rails.data ?? [], "pay"), [ rails.data ]);
    const opening = useOpenChat();
    const payment = usePayOrder(id);
    const cancelling = useCancelOrder(id);
    const refunding = useRefund();

    const talk = () => {

        if ( !data || opening.isPending ) return;

        opening.mutate({ subject: "orders", id: data.id }, {
            onSuccess: ( room ) => router.push({ pathname: "/room/[id]", params: { id: String(room), name: data.title } }),
        });

    };

    const paid = useConfirm<PaymentIntent>(( intent ) => {

        setPaying(false);
        settlePayment(intent, target);

    });

    const settle = ( gateway: number | null ) => {

        void paid.run("order-pay", ( attempt, code ) => payment.mutateAsync({ gateway, attempt, code }) );

    };

    const drop = () => {

        if ( cancelling.isPending ) return;

        cancelling.mutate(undefined, { onSuccess: () => notify(t("orders.cancelled", { context: deal }), "success") });

    };

    const back = useConfirm<unknown>(() => notify(t("orders.refundDone"), "success") );

    const reimburse = () => {

        if ( !leg ) return;

        void back.run(`order-refund:${ leg }`, ( attempt, code ) => refunding.mutateAsync({ leg, attempt, code }) );

    };

    const settleAsked = () => {

        const asked = pending;

        setPending(null);

        if ( asked === "cancel" ) drop();
        if ( asked === "refund" ) reimburse();

    };

    if ( !token ) return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("orders.detail")} onBack={() => retreat() } />
            <Guest note={t("orders.guestBody")} onLogin={() => router.push("/login") } />
        </Screen>
    );

    if ( id > 0 && order.isPending ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar title={t("orders.detail")} onBack={() => retreat() } />
                <Skeleton />
            </Screen>
        );

    }

    if ( !data ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar title={t("orders.detail")} onBack={() => retreat() } />

                {order.isError
                    ? <Trouble reason={order.error} onRetry={() => { void order.refetch(); }} />
                    : <Empty emblem="suitcase" title={t("details.missing")} />}
            </Screen>
        );

    }

    const tint: ToneName = dead(data.state) ? "danger" : settled(data.state) ? "success" : "brand";

    const outcome = cancelOutcomeOf(data);
    const cancelNote = outcome === "unpaid" ? t("orders.cancelNote", { context: deal })
        : outcome === "refund" && data.refundable ? t("orders.cancelNoteRefund", { context: deal, amount: money(data.refundable.amount, data.refundable.currency) })
            : t("orders.cancelNoteKept", { context: deal });

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("orders.detail", { context: deal })} onBack={() => retreat() } />

            <Scroll contentContainerStyle={styles.scroll}>
                <Stagger>
                    <View style={styles.block}>
                        <Order
                            title={data.title}
                            reference={data.reference}
                            state={{ label: t(`orders.state.${ data.state }`, { defaultValue: data.state }), tint }}
                            place={data.stage && !dead(data.state) ? t(`orders.stage.${ data.stage }`, { defaultValue: data.stage }) : undefined}
                            facts={facts}
                            image={data.image}
                            icon={glyphOf(data.type)}
                        />
                    </View>

                    {data.legs.length > 0 ? (
                        <View style={styles.block}>
                            <View style={styles.sheet}>
                                {data.legs.map(( held ) => (
                                    <Row
                                        key={held.id}
                                        title={t(`orders.legKind.${ held.kind }`, { defaultValue: held.kind })}
                                        note={`${ t(`wallet.state.${ held.status }`, { defaultValue: held.status }) }${ held.payment ? ` · ${ method(held.payment) }` : "" }`}
                                        value={held.amount ? money(held.amount.amount, held.amount.currency) : ""}
                                    />
                                ))}
                            </View>

                            {refundableLegs(data.legs).map(( held ) => (
                                <Button
                                    key={held.id}
                                    label={t("orders.legRefund")}
                                    kind="soft" tint="neutral"
                                    icon="refresh"
                                    loading={back.busy && leg === held.id}
                                    onPress={() => { setLeg(held.id); setPending("refund"); }}
                                />
                            ))}
                        </View>
                    ) : null}

                    {journeyLive(data.stages) && !dead(data.state) ? (
                        <View style={styles.block}>
                            <View style={[ styles.sheet, styles.pad ]}>
                                <Journey stages={data.stages} />
                            </View>
                        </View>
                    ) : null}

                    <View style={styles.block}>
                        <View style={styles.sheet}>
                            <Row title={t("orders.placed", { context: deal })} value={stamp(data.at)} />
                            {data.startsAt ? <Row title={t("orders.starts")} value={stamp(data.startsAt)} /> : null}
                            {data.endsAt ? <Row title={t("orders.ends")} value={stamp(data.endsAt)} /> : null}
                            {data.scheduledAt ? <Row title={t("orders.scheduled")} value={stamp(data.scheduledAt)} /> : null}
                            {data.nights > 0 ? <Row title={t("orders.nights")} value={t("details.nights", { count: data.nights })} /> : null}
                            {data.adults > 0 ? <Row title={t("orders.guests")} value={guests} /> : null}
                            {data.travellers > 0 ? <Row title={t("orders.travellersLabel")} value={t("orders.travellers", { count: data.travellers })} /> : null}
                            {data.delivery ? <Row title={t("orders.delivery")} value={t(`details.specs.way.${ data.delivery }`, { defaultValue: data.delivery })} /> : null}
                            {data.quantity > 1 ? <Row title={t("orders.quantity")} value={String(data.quantity)} /> : null}
                            {data.couponCode ? <Row title={t("orders.coupon")} value={data.couponCode} /> : null}
                            {data.total ? <Row strong title={t("orders.total")} value={money(data.total.amount, data.total.currency)} /> : null}
                            {data.paidAmount ? <Row title={t("orders.paid")} value={money(data.paidAmount.amount, data.paidAmount.currency)} /> : null}
                            {data.due && data.due.amount > 0 ? <Row title={t("orders.due")} value={money(data.due.amount, data.due.currency)} /> : null}
                            {data.canRefund && data.refundable && data.refundable.amount > 0 ? <Row title={t("orders.refundable")} value={money(data.refundable.amount, data.refundable.currency)} /> : null}
                        </View>
                    </View>

                    <View style={styles.block}>
                        <View style={styles.actions}>
                            {data.canPay ? <Button label={t("orders.payNow")} icon="wallet" loading={paid.busy} onPress={() => setPaying(true) } /> : null}

                            {data.canReview ? (
                                <Button label={t("orders.review")} kind="soft" icon="star" onPress={() => setPanel("review") } />
                            ) : null}

                            {mine ? (
                                <Box plane="base" depth="flat" curve="card" pad="4" clip>
                                    <Box gap="2">
                                        <Text rank="label">{t("orders.yourReview")}</Text>
                                        <Rating score={mine.rating} stars />
                                        {mine.title ? <Text rank="label">{mine.title}</Text> : null}
                                        {mine.content ? <Text rank="body" ink="soft">{mine.content}</Text> : null}
                                    </Box>
                                </Box>
                            ) : null}

                            <Button label={t("orders.chat", { context: deal })} kind="soft" tint="neutral" icon="chat" loading={opening.isPending} onPress={talk} />
                            <Button label={t("orders.support")} kind="ghost" tint="neutral" icon="support" onPress={() => setPanel("ticket") } />

                            {data.canCancel ? (
                                <>
                                    <Button label={t("orders.cancel", { context: deal })} kind="soft" tint="danger" loading={cancelling.isPending} onPress={() => setPending("cancel") } />
                                    {data.cancelBefore ? (
                                        <Text rank="micro" ink="faint" align="center">{t("orders.cancelBefore", { at: stamp(data.cancelBefore) })}</Text>
                                    ) : null}
                                </>
                            ) : null}
                        </View>
                    </View>
                </Stagger>
            </Scroll>

            <Alert
                open={pending !== null}
                title={pending ? t(`orders.${ pending }Confirm`, { context: deal }) : ""}
                body={pending === "cancel" ? cancelNote : pending ? t(`orders.${ pending }Note`, { context: deal }) : undefined}
                emblem="suitcase"
                confirm={t("common.confirm")} onConfirm={settleAsked} tone={pending === "cancel" ? "danger" : "brand"}
                cancel={t("common.back")}
                onClose={() => setPending(null) }
            />

            <ConfirmSheet
                copy={confirmCopy}
                open={back.asking}
                busy={back.busy}
                wrong={back.wrong}
                challenge={back.challenge}
                note={t("confirm.refundBody", { amount: data.refundable ? money(data.refundable.amount, data.refundable.currency) : "" })}
                onSubmit={( code ) => { void back.answer(code); }}
                onResend={() => { void back.resend(); }}
                onClose={back.dismiss}
            />

            <PaySheet
                open={paying}
                amount={data.due ? money(data.due.amount, data.due.currency) : ""}
                wallet={{
                    allowed: allows(account, "view_wallets"),
                    enough: covers(purse, data.due ?? null),
                    note: !purse ? "" : covers(purse, data.due ?? null) ? t("checkout.walletNote", { amount: money(purse.spendable, purse.currency) }) : t("checkout.walletShort"),
                }}
                rails={gateways}
                busy={paid.busy}
                onPay={( choice: PayChoice ) => settle(choice.kind === "rail" ? choice.id : null) }
                onTopUp={() => { setPaying(false); router.push("/wallet/deposit"); }}
                onClose={() => setPaying(false) }
            />

            <ConfirmSheet
                copy={confirmCopy}
                open={paid.asking}
                busy={paid.busy}
                wrong={paid.wrong}
                challenge={paid.challenge}
                note={t("confirm.checkoutBody", { amount: data.due ? money(data.due.amount, data.due.currency) : "" })}
                onSubmit={( code ) => { void paid.answer(code); }}
                onResend={() => { void paid.resend(); }}
                onClose={paid.dismiss}
            />

            <ComposeSheet
                open={panel === "review"}
                title={t("orders.reviewTitle")}
                body={t("orders.reviewBody")}
                subjectHint={t("orders.reviewSubject")}
                contentHint={t("orders.reviewContent")}
                action={t("orders.reviewAction")}
                rating={{ label: t("orders.reviewRating"), prompt: t("orders.reviewPrompt"), words: [ 1, 2, 3, 4, 5 ].map(( score ) => t(`orders.reviewScore.${ score }`) ) }}
                busy={reviewing.isPending}
                onSubmit={( composed ) => {

                    reviewing.mutate(composed, {
                        onSuccess: () => { setPanel(null); notify(t("orders.reviewDone"), "success"); },
                    });

                }}
                onClose={() => setPanel(null) }
            />

            <ComposeSheet
                open={panel === "ticket"}
                title={t("orders.ticketTitle")}
                body={t("orders.ticketBody")}
                subjectHint={t("orders.ticketSubject")}
                contentHint={t("orders.ticketContent")}
                action={t("orders.ticketAction")}
                busy={ticketing.isPending}
                onSubmit={({ title, content }) => {

                    ticketing.mutate({ title, content, order: id }, {
                        onSuccess: ( ticket ) => {

                            setPanel(null);
                            notify(t("orders.ticketDone"), "success");
                            router.push(`/ticket/${ ticket.id }`);

                        },
                    });

                }}
                onClose={() => setPanel(null) }
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    scroll: {
        gap: theme.layout.stack,
        paddingBottom: runtime.insets.bottom + theme.space["10"] + theme.space["4"],
    },
    block: {
        gap: theme.space["3"],
        paddingHorizontal: theme.layout.gutter,
    },
    sheet: {
        ...theme.depth.lift,
        borderRadius: theme.radius.panel,
        backgroundColor: theme.plane.base,
        paddingHorizontal: theme.space["4"],
    },
    pad: {
        gap: theme.space["4"],
        paddingVertical: theme.space["4"],
    },
    actions: {
        gap: theme.space["3"],
    },

}));
