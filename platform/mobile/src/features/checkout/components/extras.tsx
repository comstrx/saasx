import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Check } from "@/elements/check";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { CheckoutSection } from "@/features/checkout/components/section";
import { useMoney } from "@/features/shell/hooks/use-money";
import type { Deal } from "@/model/catalog";
import type { Extra } from "@/model/detail";

type CheckoutExtrasProps = {
    items: readonly Extra[];
    picked: ReadonlySet<number>;
    deal: Deal;
    onToggle: ( id: number ) => void;
};

export function CheckoutExtras ({ items, picked, deal, onToggle }: CheckoutExtrasProps) {

    const { t } = useTranslation();
    const cash = useMoney();

    return (
        <CheckoutSection title={t("checkout.extras")} body={t("checkout.extrasBody", { context: deal })}>
            <Box gap="4">
                {items.map(( extra ) => (
                    <Press
                        key={extra.id}
                        onPress={() => onToggle(extra.id) }
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: picked.has(extra.id) }}
                        accessibilityLabel={extra.name}
                    >
                        <Box row align="center" gap="3">
                            <Check on={picked.has(extra.id)} label={extra.name} />

                            <Text rank="body" style={styles.name}>{extra.name}</Text>

                            {extra.price ? (
                                <Text rank="action" ltr>
                                    {cash.amount(extra.price.amount, extra.price.currency)}
                                </Text>
                            ) : null}
                        </Box>
                    </Press>
                ))}
            </Box>
        </CheckoutSection>
    );

}

const styles = StyleSheet.create({

    name: {
        flex: 1,
    },

});
