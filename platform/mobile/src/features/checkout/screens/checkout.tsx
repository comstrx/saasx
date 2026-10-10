import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { type InfoRow, InfoSheet } from "@/components/info-sheet";
import { ReportLink } from "@/components/report-link";
import { Button } from "@/elements/button";
import { Dock } from "@/elements/dock";
import { Stagger } from "@/elements/motion";
import { Text } from "@/elements/text";
import { CheckoutApplicants } from "@/features/checkout/components/applicants";
import { CheckoutCoupon } from "@/features/checkout/components/coupon";
import { CouponSheet } from "@/features/checkout/components/coupon-sheet";
import { DateRangeSheet } from "@/features/checkout/components/date-range-sheet";
import { CheckoutExtras } from "@/features/checkout/components/extras";
import { CheckoutFrame } from "@/features/checkout/components/frame";
import { GuestSheet } from "@/features/checkout/components/guest-sheet";
import { CheckoutLedger } from "@/features/checkout/components/ledger";
import { CheckoutLoading } from "@/features/checkout/components/loading";
import { CheckoutPayment } from "@/features/checkout/components/payment";
import { CheckoutCancellation, CheckoutRules, cancellationOf, rulesOf } from "@/features/checkout/components/policies";
import { CheckoutRequirements } from "@/features/checkout/components/requirements";
import { CheckoutSection } from "@/features/checkout/components/section";
import { CheckoutSummary } from "@/features/checkout/components/summary";
import { CheckoutTrip } from "@/features/checkout/components/trip";
import { useCheckoutController } from "@/features/checkout/hooks/use-checkout";
import { settlePayment } from "@/features/checkout/hooks/use-payment";
import { Trouble } from "@/features/shell";
import { useConfirmCopy, useReportCopy } from "@/features/shell/copy";
import { useConfirm } from "@/features/shell/hooks/use-confirm";
import { useMoney } from "@/features/shell/hooks/use-money";
import { retreat } from "@/features/shell/retreat";
import { allows } from "@/model/account";
import { availabilityHorizon, spanOpen } from "@/model/availability";
import { dealOf } from "@/model/catalog";
import { checkoutBasket, checkoutNights, checkoutPayment, datesSettled } from "@/model/checkout";
import { usable } from "@/model/coupon";
import { baseCurrency } from "@/model/currency";
import { can, personal, seating, staying, voiceOf } from "@/model/detail";
import { type Failure, failureShape, notFound, strandedOrder } from "@/model/failure";
import { facing, lineTotal } from "@/model/order";
import type { PaymentIntent } from "@/model/payment";
import { covers, railsFor } from "@/model/wallet";
import { useAccount } from "@/query/account";
import { useCart, useCartDrop } from "@/query/cart";
import { useAvailability, useCatalog } from "@/query/catalogs";
import { useLimits, useNeeds, useRanged } from "@/query/contract";
import { useCoupons, useValidateCoupon } from "@/query/coupons";
import { useCheckout, usePreview } from "@/query/orders";
import { itemsOf } from "@/query/shelf";
import { useOpenTicket } from "@/query/tickets";
import { useBalance, useRails } from "@/query/wallet";
import { addIsoDays, formatDateSpan, todayIso } from "@/std/date-range";
import { formatDate } from "@/std/number";
import { notify } from "@/store/notice";

type CheckoutParams = {
    catalog?: string;
    cart?: string;
    sellable?: string;
    quantity?: string;
    starts?: string;
    ends?: string;
    adults?: string;
    children?: string;
};

export function CheckoutScreen () {

    const { t, i18n } = useTranslation();
    const confirmCopy = useConfirmCopy();
    const reportCopy = useReportCopy();
    const cash = useMoney();
    const params = useLocalSearchParams<CheckoutParams>();
    const [ travellersDone, setTravellersDone ] = useState(false);

    const catalogId = Number(params.catalog ?? 0) || 0;
    const cartLine = Number(params.cart ?? 0) || 0;
    const sellable = Number(params.sellable ?? 0) || undefined;
    const seededQuantity = Math.max(1, Number(params.quantity ?? 1) || 1);
    const adults = Math.max(1, Number(params.adults ?? 1) || 1);
    const children = Math.max(0, Number(params.children ?? 0) || 0);

    const line = useCart().data?.lines.find(( row ) => row.id === cartLine );
    const held = cartLine > 0 ? line?.facts : undefined;

    const initialGuests = useMemo(
        () => ({ adults: held?.adults ?? adults, children: held?.children ?? children }),
        [ adults, children, held ],
    );
    const seed = useMemo(() => ({
        starts: held?.startsAt ?? params.starts,
        ends: held?.endsAt ?? params.ends,
        adults: held?.adults ?? adults,
        children: held?.children ?? children,
        applicants: held?.applicants,
    }), [ adults, children, held, params.ends, params.starts ]);

    const catalog = useCatalog(catalogId, initialGuests);
    const payments = useRails(true);
    const account = useAccount().data;
    const checkout = useCheckout();
    const drop = useCartDrop();
    const ticketing = useOpenTicket();

    const gateways = useMemo(
        () => railsFor(payments.data ?? [], "pay"),
        [ payments.data ],
    );
    const gatewayIds = useMemo(() => gateways.map(( rail ) => rail.id ), [ gateways ]);

    const detail = catalog.data;
    const purse = useBalance();
    const purseHeld = purse.data;
    const walletAllowed = allows(account, "view_wallets");
    const needsOf = useNeeds();
    const rangedOf = useRanged();
    const ranged = rangedOf(detail?.capabilities ?? []);
    const flow = useCheckoutController(seed, gatewayIds, detail?.capacity ?? 0, walletAllowed, ranged);
    const insured = Boolean(detail) && can(detail, "underwritten");
    const named = Boolean(detail) && personal(detail);
    const deal = dealOf(detail?.capabilities ?? []);
    const voice = insured ? "cover" : deal === "purchase" ? "order" : "trip";
    const scope = useMemo(
        () => ({
            dated: needsOf(detail?.capabilities ?? []).includes("dates"),
            ranged,
            seated: Boolean(detail) && seating(detail),
        }),
        [ detail, needsOf, ranged ],
    );
    const [ counter, setCounter ] = useState(seededQuantity);
    const [ picks, setPicks ] = useState<ReadonlySet<number>>(new Set());
    const togglePick = useCallback(( id: number ) => {

        setPicks(( current ) => {

            const next = new Set(current);

            if ( next.has(id) ) next.delete(id);
            else next.add(id);

            return next;

        });

    }, []);

    const quantity = named ? Math.max(1, flow.applicants.length) : counter;

    const basket = useMemo(
        () => checkoutBasket(
            catalogId,
            sellable,
            quantity,
            flow.selection,
            scope,
            flow.coupon || undefined,
            named && flow.applicantsReady ? flow.applicants : undefined,
            picks.size > 0 ? [ ...picks ].map(( id ) => ({ id, quantity: 1 }) ) : undefined,
            flow.paymentSource === "gateway" && flow.gateway !== null
                ? { pay: "directly", gateway: flow.gateway }
                : { pay: "wallet" },
        ),
        [ catalogId, flow.applicants, flow.applicantsReady, flow.coupon, flow.gateway, flow.paymentSource, flow.selection, named, picks, quantity, scope, sellable ],
    );
    const preview = usePreview(basket, Boolean(detail) && ( !named || flow.applicantsReady ));
    const quote = preview.data;

    const wallet = useCoupons(false);
    const checking = useValidateCoupon(sellable ?? catalogId, quantity);
    const [ couponError, setCouponError ] = useState("");
    const [ info, setInfo ] = useState<"price" | "cancel" | null>(null);

    const offers = useMemo(() => {

        const now = Date.now();

        return itemsOf(wallet.data).filter(( coupon ) => usable(coupon, now) );

    }, [ wallet.data ]);

    const applyCoupon = async ( code: string ) => {

        setCouponError("");

        try {

            await checking.mutateAsync(code);
            flow.applyCoupon(code);

        }
        catch ( failure ) {

            const shape = failureShape(failure);

            if ( shape.retryable || shape.code === "throttled" ) notify(shape.body);
            else setCouponError(shape.code === "not_found" ? t("checkout.couponInvalid") : shape.body);

        }

    };

    const limits = useLimits();
    const horizon = limits.data?.horizonDays ?? availabilityHorizon;
    const window = useMemo(() => {

        const from = todayIso();

        return { from, to: addIsoDays(from, horizon) };

    }, [ horizon ]);

    const slots = useAvailability(catalogId, window.from, window.to, Boolean(detail));
    const availability = slots.data;

    const nights = checkoutNights(flow.selection);
    const charge = checkoutPayment(quote, flow.paymentPlan);
    const face = quote ? facing(quote) : null;
    const due = checkoutPayment(face, flow.paymentPlan);
    const currency = quote?.currency ?? baseCurrency;
    const shown = ( value: number ) => cash.amount(value, face?.currency ?? currency);
    const cancellation = detail ? cancellationOf(detail) : null;
    const rules = detail ? rulesOf(detail) : [];

    const extraRows = ( face?.extras ?? [] ).map(( extra ) => {

        const name = extra.name || detail?.extras.find(( row ) => row.id === extra.id )?.name || "";

        return {
            key: `extra-${ extra.id }`,
            label: extra.quantity > 1 ? `${ name } ×${ extra.quantity }` : name,
            amount: extra.total.amount,
            currency: extra.total.currency,
        };

    }).filter(( row ) => row.label );

    const priceRows: readonly InfoRow[] = face
        ? face.lines.map(( line ) => ({
            key: line.key,
            label: t(`checkout.line.${ line.key }`, { defaultValue: line.key }),
            value: shown(line.tone === "discount" ? -line.amount.amount : line.amount.amount),
        }) )
        : [];

    const cancelRows: readonly InfoRow[] = cancellation
        ? [
            ...( cancellation.freeBeforeHours > 0
                ? [ { key: "free", label: t("checkout.cancelFree"), value: t("checkout.cancelFreeHours", { count: cancellation.freeBeforeHours, context: voiceOf(detail) }) } ]
                : [] ),
            ...( cancellation.penaltyPercent > 0
                ? [ { key: "penalty", label: t("checkout.cancelPenalty"), value: `${ cancellation.penaltyPercent }%` } ]
                : [] ),
        ]
        : [];

    const seat = detail?.sellables.find(( row ) => row.id === sellable );
    const room = Math.max(1, detail?.minQuantity ?? 1);
    const bounds = [ detail?.maxQuantity, seat?.stock || detail?.stock ].filter(( value ): value is number => typeof value === "number" && value > 0 );
    const ceiling = bounds.length > 0 ? Math.min(...bounds) : null;
    const counted = Boolean(detail) && !named && !staying(detail) && !seating(detail) && ( ceiling === null || ceiling > room );
    const shipped = can(detail, "deliverable") && detail?.delivery === "shipping";

    const balance = purseHeld?.available ?? 0;
    const walletEnough = covers(purseHeld, quote ? { amount: charge, currency: quote.currency } : null);
    const paymentReady = flow.paymentSource === "wallet"
        ? walletAllowed && walletEnough
        : flow.gateway !== null;
    const bookable = !availability || spanOpen(availability, flow.selection.dates.start, flow.selection.dates.end);
    const addressed = !shipped || Boolean(account?.location?.address);
    const ready = Boolean(quote) && !preview.isFetching && !preview.isPlaceholderData && !preview.isError && ( !scope.dated || datesSettled(flow.selection.dates, scope.ranged) ) && charge > 0 && paymentReady && bookable && addressed && ( !named || flow.applicantsReady );
    const blocker = !addressed ? t("checkout.needAddress")
        : named && !flow.applicantsReady ? t("checkout.needApplicants")
            : flow.paymentSource === "wallet" && walletAllowed && !walletEnough ? t("checkout.needFunds")
                : null;

    const land = useCallback(( intent: PaymentIntent ) => {

        const order = intent.order ?? 0;

        if ( cartLine > 0 ) drop.mutate({ line: cartLine, catalog: catalogId });

        settlePayment(intent, order > 0 ? { kind: "order", id: order } : { kind: "orders" });

        if ( order > 0 ) { router.replace({ pathname: "/thanks", params: { order: String(order) } }); return; }

        router.replace("/orders");

    }, [ cartLine, catalogId, drop ]);

    const strand = useCallback(( failure: Failure ) => {

        const order = strandedOrder(failure);

        if ( !order ) return false;

        if ( cartLine > 0 ) drop.mutate({ line: cartLine, catalog: catalogId });

        notify(t("checkout.stranded"));
        router.replace(`/order/${ order }`);

        return true;

    }, [ cartLine, catalogId, drop, t ]);

    const settling = useConfirm(land, [], strand);

    const confirm = () => {

        if ( !detail || !quote || !ready ) return;

        const pay = flow.paymentSource === "wallet" ? "wallet" : "directly";

        void settling.run("checkout", ( attempt, code ) => checkout.mutateAsync({
            basket,
            pay,
            token: quote.token,
            gateway: pay === "directly" ? flow.gateway : null,
            amount: charge,
            currency: quote.currency,
            attempt,
            code,
        }));

    };

    const raise = ( reason: string, note: string ) => {

        ticketing.mutate({
            title: t("checkout.reportTitle", { context: deal }),
            content: [ t(`details.reportReason.${ reason }`, reason), note, `#${ catalogId } ${ detail?.name ?? "" }` ].filter(Boolean).join("\n\n"),
        }, {
            onSuccess: ( ticket ) => {

                notify(t("checkout.reportSent", { context: deal }), "success");
                router.push(`/ticket/${ ticket.id }`);

            },
        });

    };

    const retry = () => {

        void catalog.refetch();
        void preview.refetch();

    };

    const frame = ( children: ReactNode, footer?: ReactNode ) => (
        <CheckoutFrame
            title={t("checkout.title")}
            onBack={() => retreat() }
            footer={footer}
        >
            {children}
        </CheckoutFrame>
    );

    if ( catalogId <= 0 ) {

        return frame(
            <Trouble
                reason={notFound}
                action={t("thanks.home")}
                onAction={() => router.replace("/") }
            />,
        );

    }

    if ( ( catalog.isError && !detail ) || preview.isError ) {

        const failed = preview.error ?? catalog.error;
        const stuck = !failureShape(failed).retryable;

        return frame(<Trouble reason={failed} action={stuck ? t("common.back") : undefined} onAction={stuck ? () => retreat() : retry} />);

    }

    if ( detail && named && !travellersDone ) {

        return (
            <>
                {frame(
                    <Stagger>
                        <CheckoutSummary detail={detail} sellable={sellable} />

                        {scope.dated ? (
                            <CheckoutTrip
                                dates={scope.ranged
                                    ? formatDateSpan(i18n.language, flow.selection.dates)
                                    : formatDate(i18n.language, flow.selection.dates.start, "medium")}
                                guests={flow.selection.guests}
                                nights={scope.ranged ? nights : 0}
                                dated
                                guested={false}
                                voice={voice}
                                onDates={flow.openDates}
                                onGuests={flow.openGuests}
                            />
                        ) : null}

                        <CheckoutApplicants
                            applicants={flow.applicants}
                            title={insured ? undefined : t("checkout.travellers")}
                            body={insured ? undefined : t("checkout.travellersBody")}
                            onAdd={flow.addApplicant}
                            onDrop={flow.dropApplicant}
                            onEdit={flow.editApplicant}
                        />
                    </Stagger>,
                    <Dock>
                        <Button
                            label={t("common.continue")}
                            disabled={!flow.applicantsReady}
                            onPress={() => setTravellersDone(true) }
                        />
                    </Dock>,
                )}

                <DateRangeSheet
                    open={flow.panel === "dates"}
                    ahead={limits.data?.aheadDays}
                    value={flow.dateDraft}
                    valid={flow.datesReady && ( !availability || spanOpen(availability, flow.dateDraft.start, flow.dateDraft.end) )}
                    single={!ranged}
                    availability={availability}
                    currency={currency}
                    onSelect={flow.chooseDate}
                    onClear={flow.clearDates}
                    onSave={flow.saveDates}
                    onClose={flow.closePanel}
                />
            </>
        );

    }

    if ( !detail || !quote || !face ) return frame(<CheckoutLoading />);

    return (
        <>
            {frame(
                <Stagger>
                    <CheckoutSummary detail={detail} sellable={sellable} />

                    {scope.dated || seating(detail) || counted ? <CheckoutTrip
                        dates={scope.ranged
                            ? formatDateSpan(i18n.language, flow.selection.dates)
                            : formatDate(i18n.language, flow.selection.dates.start, "medium")}
                        guests={flow.selection.guests}
                        nights={scope.ranged ? nights : 0}
                        dated={scope.dated}
                        ranged={scope.ranged}
                        guested={seating(detail)}
                        voice={voice}
                        count={counted
                            ? {
                                value: quantity,
                                min: room,
                                max: ceiling ?? Number.MAX_SAFE_INTEGER,
                                note: ceiling === null ? undefined : t("checkout.quantityNote", { count: ceiling }),
                                onChange: setCounter,
                            }
                            : undefined}
                        onDates={flow.openDates}
                        onGuests={flow.openGuests}
                    /> : null}

                    {detail.extras.length > 0 ? <CheckoutExtras items={detail.extras} picked={picks} deal={deal} onToggle={togglePick} /> : null}

                    <CheckoutCoupon
                        code={flow.coupon}
                        saved={shown(lineTotal(face.lines, "discount", [ "coupon" ]))}
                        onOpen={flow.openCoupon}
                        onRemove={flow.clearCoupon}
                    />

                    <CheckoutLedger face={face} extras={extraRows} onInfo={() => setInfo("price") } />

                    {named ? (
                        <CheckoutApplicants
                            applicants={flow.applicants}
                            title={insured ? undefined : t("checkout.travellers")}
                            body={insured ? undefined : t("checkout.travellersBody")}
                            premiums={face.premiums}
                            currency={face.currency}
                            onAdd={flow.addApplicant}
                            onDrop={flow.dropApplicant}
                            onEdit={flow.editApplicant}
                        />
                    ) : null}

                    <CheckoutRequirements
                        phone={account?.phone ?? ""}
                        image={account?.image ?? null}
                        deal={deal}
                        voice={voice}
                        photo={staying(detail)}
                        address={shipped ? account?.location?.address ?? "" : undefined}
                        onPersonal={() => router.push("/personal") }
                    />

                    <CheckoutPayment
                        face={face}
                        deal={deal}
                        gateways={gateways}
                        gateway={flow.gateway}
                        source={flow.paymentSource}
                        plan={flow.paymentPlan}
                        walletAllowed={walletAllowed}
                        walletBalance={balance}
                        walletCurrency={purseHeld?.currency ?? face.currency}
                        walletEnough={walletEnough}
                        onPlan={flow.setPaymentPlan}
                        onGateway={( id ) => {

                            flow.setGateway(id);
                            flow.setPaymentSource("gateway");

                        }}
                        onWallet={() => flow.setPaymentSource("wallet") }
                        onTopUp={() => router.push("/wallet/deposit") }
                    />

                    {cancellation ? <CheckoutCancellation policy={cancellation} deal={deal} onDetails={() => setInfo("cancel") } /> : null}

                    {rules.length > 0 ? <CheckoutRules rules={rules} voice={voiceOf(detail)} /> : null}

                    <CheckoutSection>
                        <Text rank="caption" ink="soft">{t("checkout.legal", { context: staying(detail) ? "stay" : deal })}</Text>
                    </CheckoutSection>

                    <ReportLink
                        {...reportCopy}
                        label={t("checkout.report")}
                        title={t("checkout.reportTitle", { context: deal })}
                        body={t("checkout.reportBody", { context: deal })}
                        busy={ticketing.isPending}
                        onSubmit={raise}
                    />
                </Stagger>,
                <Dock>
                    <Button
                        label={blocker ?? t("checkout.pay", { amount: shown(due) })}
                        loading={settling.busy || preview.isFetching}
                        disabled={!ready}
                        onPress={confirm}
                    />
                </Dock>,
            )}

            <InfoSheet
                action={t("common.done")}
                open={info !== null}
                title={info === "price" ? t("checkout.priceInfo") : t("checkout.cancellationPolicy")}
                body={info === "price"
                    ? t("checkout.priceInfoBody")
                    : cancellation?.description || t("checkout.cancellationFallback", { context: deal })}
                rows={info === "price" ? priceRows : cancelRows}
                note={info === "price" ? t("checkout.priceInfoCurrency", { currency: face?.currency ?? "" }) : undefined}
                onClose={() => setInfo(null)}
            />

            <DateRangeSheet
                open={flow.panel === "dates"}
                ahead={limits.data?.aheadDays}
                value={flow.dateDraft}
                valid={flow.datesReady && ( !availability || spanOpen(availability, flow.dateDraft.start, flow.dateDraft.end) )}
                single={!ranged}
                availability={availability}
                currency={currency}
                onSelect={flow.chooseDate}
                onClear={flow.clearDates}
                onSave={flow.saveDates}
                onClose={flow.closePanel}
            />

            <ConfirmSheet
                copy={confirmCopy}
                open={settling.asking}
                busy={settling.busy}
                wrong={settling.wrong}
                challenge={settling.challenge}
                note={t("confirm.checkoutBody", { amount: shown(due) })}
                onSubmit={( code ) => { void settling.answer(code); }}
                onResend={() => { void settling.resend(); }}
                onClose={settling.dismiss}
            />

            <CouponSheet
                open={flow.panel === "coupon"}
                coupons={offers}
                value={flow.coupon}
                busy={checking.isPending}
                error={couponError}
                onApply={( code ) => { void applyCoupon(code); }}
                onClose={flow.closePanel}
            />

            <GuestSheet
                open={flow.panel === "guests"}
                value={flow.guestDraft}
                capacity={detail.capacity}
                valid={flow.guestsReady}
                onChange={flow.changeGuest}
                onSave={flow.saveGuests}
                onClose={flow.closePanel}
            />
        </>
    );

}
