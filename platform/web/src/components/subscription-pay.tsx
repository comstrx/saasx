"use client";

import ConfirmCode from "@/components/confirm-code";
import FormFeedback from "@/components/form-feedback";
import PaymentChoices from "@/components/payment-choices";
import SectionSkeleton from "@/components/section-skeleton";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Stack from "@/elements/stack";
import { useSubscriptionPay } from "@/hooks/use-subscription-pay";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = { subscriptionId: number | null; name: string; onClose: () => void; onDone: () => void };

export default function SubscriptionPay ({ subscriptionId, name, onClose, onDone }: Props) {

    const t = useTranslations("subscriptions");
    const data = useSubscriptionPay(subscriptionId, onDone);
    const { confirmation } = data;

    return (

        <Dialog
            open={subscriptionId != null}
            onOpenChange={( open ) => { if ( !open && !data.pending ) onClose(); }}
            title={t("payTitle", { plan: name })}
            description={t("payBody")}
            close={t("close")}
            dismissible={!data.pending}
            footer={(

                <>

                    <Button variant="ghost" disabled={data.pending} onClick={onClose}>{t("close")}</Button>

                    <Button pending={data.pending} onClick={() => { void data.submit(); }}><Icon name="lock" />{t("payNow")}</Button>

                </>

            )}
        >

            {data.loading ? <SectionSkeleton /> : (

                <Stack gap={5}>

                    <PaymentChoices
                        id="subscription-currency"
                        value={data.method}
                        options={data.choices.options}
                        currency={data.currency}
                        currencies={data.choices.currencies}
                        disabled={data.pending}
                        onChange={data.setMethod}
                        onCurrency={data.setCurrency}
                    />

                    {confirmation.challenge ? (

                        <ConfirmCode
                            id={confirmation.id}
                            challenge={confirmation.challenge}
                            code={confirmation.code}
                            retry={confirmation.retry}
                            expired={confirmation.expired}
                            disabled={data.pending}
                            onCode={confirmation.setCode}
                            onResend={() => { void data.submit(true); }}
                        />

                    ) : null}

                    <FormFeedback id="subscription-pay-failure" error={data.error} />

                </Stack>

            )}

        </Dialog>

    );

}
