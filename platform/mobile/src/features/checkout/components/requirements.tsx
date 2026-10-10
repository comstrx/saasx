import { useTranslation } from "react-i18next";
import { CheckoutRow } from "@/features/checkout/components/row";
import { CheckoutSection } from "@/features/checkout/components/section";
import type { CheckoutTripVoice } from "@/features/checkout/components/trip";
import type { Deal } from "@/model/catalog";

type CheckoutRequirementsProps = {
    phone: string;
    image: string | null;
    deal: Deal;
    voice?: CheckoutTripVoice;
    photo?: boolean;
    address?: string | null | undefined;
    onPersonal: () => void;
};

export function CheckoutRequirements ({ phone, image, deal, voice = "trip", photo = true, address, onPersonal }: CheckoutRequirementsProps) {

    const { t } = useTranslation();

    return (
        <CheckoutSection title={t(voice === "order" ? "checkout.orderRequired" : "checkout.tripRequired")}>
            <CheckoutRow
                label={t("checkout.phone")}
                body={phone || t("checkout.phoneBody", { context: deal })}
                ink={phone ? undefined : "soft"}
                ltr={Boolean(phone)}
                action={phone ? t("checkout.complete") : t("checkout.add")}
                kind="button"
                done={Boolean(phone)}
                onPress={onPersonal}
            />

            {address !== undefined ? (
                <CheckoutRow
                    label={t("checkout.address")}
                    body={address || t("checkout.addressBody")}
                    ink={address ? undefined : "soft"}
                    action={address ? t("checkout.complete") : t("checkout.add")}
                    kind="button"
                    done={Boolean(address)}
                    onPress={onPersonal}
                />
            ) : null}

            {photo ? (
                <CheckoutRow
                    label={t("checkout.profilePhoto")}
                    body={t("checkout.profilePhotoBody")}
                    ink="soft"
                    action={image ? t("checkout.complete") : t("checkout.add")}
                    kind="button"
                    done={Boolean(image)}
                    onPress={onPersonal}
                />
            ) : null}
        </CheckoutSection>
    );

}
