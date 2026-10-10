"use client";

import AttemptRecovery from "@/components/attempt-recovery";
import FormPanel from "@/components/form-panel";
import NavigationLinks from "@/components/navigation-links";
import OrderReceipt from "@/components/order-receipt";
import type { useCartMutation } from "@/hooks/use-cart-mutation";
import { useTranslations } from "@/lib/providers/intl";
import type { CheckoutLinks } from "../hooks/use-checkout-route";
import type { PurchaseAttempt } from "../hooks/use-order-attempt";
import { useSettlement } from "../hooks/use-settlement";

type Props = {
    title: string; back: string; links: CheckoutLinks; action: PurchaseAttempt;
    preparation: ReturnType<typeof useCartMutation>; allowed: boolean; editable: boolean;
};

export default function CartRecovery ({ title, back, links, action, preparation, allowed, editable }: Props) {

    const t = useTranslations("checkout");
    const cart = useTranslations("cart");
    const state = useSettlement(action, null, "wallet", links);

    return (

        <FormPanel title={title} footer={<NavigationLinks items={[{ href: back, label: cart("back") }]} />}>

            {state.result ? <OrderReceipt
                title={t("created")} description={t(state.failedPayment ? "createdPaymentFailed" : "orderSaved")}
                reference={t("orderReference", { id: state.result.orderId })} href={state.href} label={t("viewOrder")}
                payment={state.payUrl ? { href: state.payUrl, label: t("continuePayment") } : undefined}
            /> : state.recovery ? <AttemptRecovery
                title={t("recoveryTitle")} description={allowed ? state.recoveryMessage : cart("purchaseDenied")}
                label={t("retryOrder")} pending={state.pending} blocked={state.blocked || !allowed}
                onRetry={state.submit} summary={state.recoveryAmount}
            /> : <AttemptRecovery
                title={cart("preparingTitle")}
                description={cart(!editable ? "editPermission" : preparation.blocked ? "blocked" : "prepareRecovery")}
                label={cart("retry")} pending={preparation.pending} blocked={preparation.blocked || !editable}
                onRetry={() => { void preparation.run(); }}
            />}

        </FormPanel>

    );

}
