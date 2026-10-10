import { useTranslation } from "react-i18next";
import { CheckoutRow } from "@/features/checkout/components/row";
import { CheckoutSection } from "@/features/checkout/components/section";

type CheckoutCouponProps = {
    code: string;
    saved: string;
    onOpen: () => void;
    onRemove: () => void;
};

export function CheckoutCoupon ({ code, saved, onOpen, onRemove }: CheckoutCouponProps) {

    const { t } = useTranslation();
    const applied = code.length > 0;

    return (
        <CheckoutSection>
            <CheckoutRow
                label={applied ? code : t("checkout.couponTitle")}
                body={applied ? t("checkout.couponSaved", { amount: saved }) : t("checkout.couponBody")}
                ink="soft" tint={applied ? "success" : undefined}
                action={applied ? t("checkout.couponRemove") : t("checkout.add")}
                onPress={applied ? onRemove : onOpen}
            />
        </CheckoutSection>
    );

}
