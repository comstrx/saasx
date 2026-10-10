import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Choice } from "@/components/choice";
import { Box } from "@/elements/box";
import { Plate } from "@/elements/plate";
import { Spec } from "@/elements/spec";
import { Text } from "@/elements/text";
import { CheckoutSection } from "@/features/checkout/components/section";
import { useMoney } from "@/features/shell/hooks/use-money";
import type { Deal } from "@/model/catalog";
import type { CheckoutPaymentPlan, CheckoutPaymentSource } from "@/model/checkout";
import type { QuoteFace } from "@/model/order";
import { type Rail, railGlyph, railInitial } from "@/model/wallet";
import { useTheme } from "@/theme/use-theme";

type CheckoutPaymentProps = {
    face: QuoteFace;
    deal: Deal;
    gateways: readonly Rail[];
    gateway: number | null;
    source: CheckoutPaymentSource;
    plan: CheckoutPaymentPlan;
    walletAllowed: boolean;
    walletBalance: number;
    walletCurrency: string;
    walletEnough: boolean;
    onPlan: ( plan: CheckoutPaymentPlan ) => void;
    onGateway: ( id: number ) => void;
    onWallet: () => void;
    onTopUp: () => void;
};

export function RailFigure ({ rail }: { rail?: Rail | undefined }) {

    const theme = useTheme();
    const [ broken, setBroken ] = useState(false);
    const shot = rail?.image && !broken ? rail.image : null;
    const initial = rail && !shot ? railInitial(rail) : null;

    return (
        <Plate tone="brand" look="quiet" size={theme.control.sm.height} icon={shot || initial ? undefined : rail ? railGlyph(rail) : "wallet"}>
            {shot
                ? <Image source={shot} style={styles.mark} contentFit="contain" transition={140} onError={() => setBroken(true) } />
                : initial ? <Text rank="label" color={theme.tone.brand.onSoft} ltr>{initial}</Text> : null}
        </Plate>
    );

}

export function CheckoutPayment ({
    face,
    deal,
    gateways,
    gateway,
    source,
    plan,
    walletAllowed,
    walletBalance,
    walletCurrency,
    walletEnough,
    onPlan,
    onGateway,
    onWallet,
    onTopUp,
}: CheckoutPaymentProps) {

    const { t } = useTranslation();
    const cash = useMoney();
    const money = ( amount: number ) => cash.amount(amount, face.currency);
    const options = face.options.filter(( option ) => option.allowed );

    return (
        <CheckoutSection title={t("checkout.payChoice")}>
            <Box gap="2">
                {options.map(( option ) => {

                    const label = t(`checkout.pay_${ option.kind }`, { amount: money(option.dueNow) });
                    const note = option.dueLater > 0
                        ? t("checkout.payLaterBody", { due: money(option.dueLater), context: deal })
                        : t("checkout.payFullBody", { context: deal });

                    return options.length === 1
                        ? <Spec key={option.kind} label={label} note={note} strong />
                        : <Choice key={option.kind} kind="radio" trail boxed label={label} note={note} selected={plan === option.kind} onPress={() => onPlan(option.kind) } />;

                })}
            </Box>

            <Box gap="2">
                <Text rank="label">{t("checkout.paymentSource")}</Text>

                {walletAllowed ? (
                    <Choice
                        kind="radio"
                        trail
                        boxed
                        figure={<RailFigure />}
                        label={t("checkout.wallet")}
                        note={walletEnough
                            ? t("checkout.walletNote", { amount: cash.amount(walletBalance, walletCurrency) })
                            : t("checkout.walletShort")}
                        selected={walletEnough && source === "wallet"}
                        onPress={walletEnough ? onWallet : onTopUp}
                    />
                ) : null}

                {!walletAllowed && gateways.length === 0 ? (
                    <Text rank="caption" ink="soft">{t("checkout.noRails")}</Text>
                ) : null}

                {gateways.map(( entry ) => (
                    <Choice
                        key={entry.id}
                        kind="radio"
                        trail
                        boxed
                        figure={<RailFigure rail={entry} />}
                        label={entry.name}
                        note={entry.note}
                        selected={source === "gateway" && gateway === entry.id}
                        onPress={() => onGateway(entry.id) }
                    />
                ))}
            </Box>
        </CheckoutSection>
    );

}

const styles = StyleSheet.create({

    mark: {
        width: "78%",
        height: "78%",
    },

});
