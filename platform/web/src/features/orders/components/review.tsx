"use client";

import { useState } from "react";
import type { Data } from "@/api/features";
import ApplicantList from "@/components/applicant-list";
import AttemptRecovery from "@/components/attempt-recovery";
import BookingExtras from "@/components/booking-extras";
import BookingSummary from "@/components/booking-summary";
import ContentSection from "@/components/content-section";
import FormRetry from "@/components/form-retry";
import FormSection from "@/components/form-section";
import Message from "@/components/message";
import OrderReceipt from "@/components/order-receipt";
import PurchaseContact from "@/components/purchase-contact";
import Questionnaire from "@/components/questionnaire";
import QuoteSummary from "@/components/quote-summary";
import ReservationForm from "@/components/reservation-form";
import SaveToCart from "@/components/save-to-cart";
import SettlementForm from "@/components/settlement-form";
import SlotPicker from "@/components/slot-picker";
import TaskLayout from "@/components/task-layout";
import { useBookingPolicies } from "@/hooks/use-booking-policies";
import { usePaymentChoices } from "@/hooks/use-payment-choices";
import { useTranslations } from "@/lib/providers/intl";
import { type GroupReview, useCartReview } from "../hooks/use-cart-review";
import { type CartPreparation, useCheckoutForm } from "../hooks/use-checkout-form";
import type { CheckoutLinks } from "../hooks/use-checkout-route";
import type { PurchaseAttempt } from "../hooks/use-order-attempt";
import { useSettlement } from "../hooks/use-settlement";

type Props = {
    data: Data<"products", "order">; query: string; back: string | null; title: string; links: CheckoutLinks;
    action: PurchaseAttempt; cart?: CartPreparation; disabled?: boolean; productHref?: string | null;
    notice?: { message: string; retry?: () => void }; group?: GroupReview;
};

export default function Review ({
    data, query, back, title, links, action, cart, disabled, notice, productHref, group,
}: Props) {

    const [savingCart, setSavingCart] = useState(false);
    const checkout = useCheckoutForm(data.product, query, cart, group?.review);
    const { form, current } = checkout;
    const t = useTranslations("checkout");
    const settlement = useSettlement(action, current, checkout.method, links, cart?.item.id);
    const policies = useBookingPolicies(data.product.policies);
    const paymentChoices = usePaymentChoices(group ? [] : data.gateways, checkout.method, data.product.allow_pay_later === true);
    const cartText = useTranslations("cart");
    const batch = useTranslations("cartPurchase");
    const staging = useCartReview(group, data.product, current, form.values, checkout.method, settlement.selected, cart?.item.id);
    const preparing = !!cart && (cart.mutation.pending || !!cart.mutation.attempt || cart.mutation.blocked);
    const held = savingCart || preparing || !!disabled;
    const error = checkout.preview.error ?? cart?.mutation.error;
    const message = staging.message || checkout.extraFailure || (error
        ? Object.values(error.errors).flat()[0] || t(error.status === 429 ? "rateLimited" : "failed") : null);

    return (

        <TaskLayout
            title={title} description={group ? batch("itemDescription") : t("description")} label={t("summary")} asideFirst
            progress={group ? undefined : { label: t("progress"), items: checkout.progress(!!settlement.result) }}
            back={back ? { href: back, label: group ? batch("back") : cart ? cartText("back") : t("back") } : null}
            aside={(

                <BookingSummary name={data.product.name} image={data.product.image} href={cart ? productHref : back}>

                    {current ? <QuoteSummary quote={current.quote} id={form.id("price")} />
                        : !settlement.recovery && !settlement.result ? <Message>{t("quoteHint")}</Message> : null}
                    {current && !settlement.recovery && !settlement.result && settlement.ready ? (

                        <SettlementForm
                            {...settlement} disabled={held} method={checkout.method}
                            onKind={settlement.setKind} onCode={settlement.setCode}
                            onSubmit={group ? staging.save : settlement.submit} onRefresh={checkout.quote}
                            actionLabel={group ? batch("saveReview") : undefined} commitment={!group}
                        />

                    ) : null}
                    {!cart && !settlement.recovery && !settlement.result && links.cart ? <SaveToCart
                        input={checkout.input} href={links.cart} validate={checkout.checkSaved} onBusy={setSavingCart}
                        disabled={settlement.locked || checkout.pending}
                    /> : null}

                </BookingSummary>

            )}
        >

            {notice && !settlement.recovery && !settlement.result && !preparing ? <FormSection>

                {notice.retry ? <FormRetry
                    id={form.id("refresh-cart")} message={notice.message} label={cartText("refresh")} onRetry={notice.retry}
                /> : <Message>{notice.message}</Message>}

            </FormSection> : null}
            {preparing && cart ? <FormSection>

                <AttemptRecovery
                    title={cartText("preparingTitle")}
                    description={cartText(!cart.editable ? "editPermission" : cart.mutation.blocked ? "blocked" : "prepareRecovery")}
                    label={cartText("retry")} pending={cart.mutation.pending}
                    blocked={cart.mutation.blocked || !cart.editable}
                    onRetry={() => { void cart.mutation.run(); }}
                />

            </FormSection> : null}
            {settlement.result ? (

                <FormSection>

                    <OrderReceipt
                        art={settlement.failedPayment ? undefined : links.success}
                        tone={settlement.failedPayment ? "attention" : "positive"}
                        title={t("created")} description={t(settlement.failedPayment ? "createdPaymentFailed" : "orderSaved")}
                        reference={t("orderReference", { id: settlement.result.orderId })}
                        href={settlement.href} label={t("viewOrder")}
                        payment={settlement.payUrl ? { href: settlement.payUrl, label: t("continuePayment") } : undefined}
                        again={cart ? undefined : {
                            label: t("bookAgain"), onClick: () => { if ( settlement.restart() ) checkout.reset(); },
                        }}
                    />

                </FormSection>

            ) : settlement.recovery ? (

                <FormSection>

                    <AttemptRecovery
                        title={t("recoveryTitle")} description={disabled && notice ? notice.message : settlement.recoveryMessage}
                        label={t("retryOrder")}
                        pending={settlement.pending} blocked={settlement.blocked || !!disabled} onRetry={settlement.submit}
                        summary={settlement.recoveryAmount}
                    />

                </FormSection>

            ) : (

                <ReservationForm
                    paymentHint={group ? batch("methodHint") : undefined}
                    fields={{
                        values: form.values, rules: checkout.rules, errors: form.errors, tiers: checkout.tiers,
                        today: checkout.today, id: form.id, onChange: form.change,
                    }}
                    payment={{
                        id: form.id("payment_currency"), value: checkout.method, ...paymentChoices,
                        currency: checkout.currency, onCurrency: checkout.setCurrency,
                        onChange: ( value ) => { checkout.setMethod(value); checkout.setCurrency(""); },
                    }}
                    pending={checkout.pending} reviewed={!!current} disabled={settlement.locked || held} error={message}
                    coupon={cart ? { kind: "cart", cartId: cart.item.id } : {
                        kind: "product", productId: data.product.id, quantity: Number(form.values.quantity) || 1,
                    }}
                    onSubmit={() => { if ( !settlement.locked && !held ) checkout.quote(); }}
                    additional={checkout.rules.scheduled ? (

                        <SlotPicker
                            {...checkout.slots} id={form.id("slot")} value={form.values.slot} error={form.errors.slot}
                            disabled={settlement.locked || checkout.pending || held}
                            onChange={( value ) => form.change({ slot: value })}
                        />

                    ) : undefined}
                >

                    {checkout.rules.named ? (

                        <ApplicantList
                            rows={checkout.applicants} enabled={checkout.applicantsEnabled} required={!!checkout.rules.namedRequired}
                            today={checkout.today} errors={form.errors} id={form.id} onChange={form.change}
                            disabled={settlement.locked || checkout.pending || held}
                        />

                    ) : null}

                    <Questionnaire
                        groups={checkout.questions.groups} values={form.values} errors={form.errors}
                        id={form.id} onChange={form.change} disabled={settlement.locked || checkout.pending || held}
                    />

                    <BookingExtras
                        extras={checkout.extras} today={checkout.today} currency={data.product.currency}
                        errors={form.submitted ? checkout.extras.errors : {}} id={form.id} onChange={form.change}
                        disabled={settlement.locked || checkout.pending || held}
                    />
                    <PurchaseContact
                        values={form.values} errors={form.errors} id={form.id} onChange={form.change}
                        delivery={data.product.delivery} disabled={settlement.locked || checkout.pending || held}
                    />

                </ReservationForm>

            )}

            <ContentSection
                title={t("policies")}
                disclosures={policies}
            />

        </TaskLayout>

    );

}
