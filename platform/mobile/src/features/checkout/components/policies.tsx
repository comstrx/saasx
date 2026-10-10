import { useTranslation } from "react-i18next";
import { Box } from "@/elements/box";
import { Link } from "@/elements/link";
import { Text } from "@/elements/text";
import { CheckoutSection } from "@/features/checkout/components/section";
import type { Deal } from "@/model/catalog";
import type { Detail, Voice } from "@/model/detail";

export const cancellationOf = ( detail: Detail ) =>
    detail.policies.find(( policy ) => policy.refundable || policy.key === "cancellation" ) ?? null;

export const rulesOf = ( detail: Detail ) =>
    detail.rules.filter(( rule ) => Boolean(rule.label || rule.value) ).slice(0, 4);

type CheckoutCancellationProps = {
    policy: NonNullable<ReturnType<typeof cancellationOf>>;
    deal: Deal;
    onDetails: () => void;
};

export function CheckoutCancellation ({ policy, deal, onDetails }: CheckoutCancellationProps) {

    const { t } = useTranslation();

    return (
        <CheckoutSection title={t("checkout.cancellationPolicy")}>
            <Text rank="body" ink="soft">{policy.description || t("checkout.cancellationFallback", { context: deal })}</Text>
            <Link label={t("checkout.moreDetails")} rank="body" onPress={onDetails} />
        </CheckoutSection>
    );

}

type CheckoutRulesProps = {
    rules: ReturnType<typeof rulesOf>;
    voice: Voice;
};

export function CheckoutRules ({ rules, voice }: CheckoutRulesProps) {

    const { t } = useTranslation();

    return (
        <CheckoutSection title={t("checkout.groundRules")} body={t("checkout.groundRulesBody", { context: voice })}>
            <Box gap="3">
                {rules.map(( rule ) => (
                    <Text key={rule.key} rank="body" ink="soft">{"\u2022"} {rule.label}{rule.value ? `: ${ rule.value }` : ""}</Text>
                ))}
            </Box>
        </CheckoutSection>
    );

}
