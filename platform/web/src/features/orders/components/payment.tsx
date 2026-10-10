"use client";

import AttemptRecovery from "@/components/attempt-recovery";
import FormAction from "@/components/form-action";
import FormFeedback from "@/components/form-feedback";
import FormSection from "@/components/form-section";
import PaymentChoices from "@/components/payment-choices";
import PaymentResult from "@/components/payment-result";
import SettlementForm from "@/components/settlement-form";
import { useTranslations } from "@/lib/providers/intl";
import { useOrderPayment } from "../hooks/use-order-payment";

export default function Payment ({ orderId }: { orderId: number }) {

    const payment = useOrderPayment(orderId);
    const t = useTranslations("checkout");

    return (

        <FormSection title={t("completePayment")}>

            {payment.done ? <PaymentResult text={t("paymentSubmitted")} href={payment.href} label={t("continuePayment")} /> : (

                <PaymentChoices
                    id={`${payment.id}-currency`} value={payment.method} {...payment.choices} currency={payment.currency}
                    disabled={payment.locked || payment.reviewing} onCurrency={payment.setCurrency}
                    onChange={( value ) => { payment.setMethod(value); payment.setCurrency(""); }}
                />

            )}

            <FormFeedback id={`${payment.id}-gateways`} message={payment.gatewayFailure} />

            {payment.recovery ? (

                <AttemptRecovery
                    title={t("recoveryTitle")} description={payment.recoveryMessage} label={t("retryPayment")}
                    pending={payment.pending} blocked={payment.blocked} onRetry={payment.submit}
                />

            ) : payment.current && !payment.done ? (

                <SettlementForm
                    {...payment} kind="full" choices={[{ value: "full", label: payment.label }]}
                    onKind={() => {}} onCode={payment.setCode} onSubmit={payment.submit} onRefresh={payment.review}
                    actionLabel={payment.label} commitment={false}
                />

            ) : !payment.done && payment.ready ? (

                <FormAction label={t("reviewPayment")} onClick={payment.review} pending={payment.reviewing} />

            ) : null}

            {!payment.current && !payment.recovery ? <FormFeedback id={`${payment.id}-failure`} error={payment.message} /> : null}

        </FormSection>

    );

}
