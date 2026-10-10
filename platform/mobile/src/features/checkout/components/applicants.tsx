import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Field } from "@/elements/field";
import { Icon } from "@/elements/icon";
import { Round } from "@/elements/round";
import { Surface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { CheckoutSection } from "@/features/checkout/components/section";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type Applicant, applicantReady } from "@/model/checkout";
import { baseCurrency } from "@/model/currency";
import { useTheme } from "@/theme/use-theme";

type ApplicantFieldsProps = {
    applicants: readonly Applicant[];
    premiums?: readonly number[] | undefined;
    currency?: string | undefined;
    limit?: number;
    onAdd: () => void;
    onDrop: ( key: string ) => void;
    onEdit: ( key: string, patch: Partial<Omit<Applicant, "key">> ) => void;
};

type CheckoutApplicantsProps = ApplicantFieldsProps & {
    title?: string | undefined;
    body?: string | undefined;
};

const digits = ( value: string ): string => {

    const bare = value.replace(/\D/g, "").slice(0, 8);
    const year = bare.slice(0, 4);
    const month = bare.slice(4, 6);
    const day = bare.slice(6, 8);

    return [ year, month, day ].filter(( part ) => part.length > 0 ).join("-");

};

export function CheckoutApplicants ({ title, body, ...fields }: CheckoutApplicantsProps) {

    const { t } = useTranslation();

    return (
        <CheckoutSection title={title ?? t("checkout.applicants")} body={body ?? t("checkout.applicantsBody")}>
            <ApplicantFields {...fields} />
        </CheckoutSection>
    );

}

export function ApplicantFields ({ applicants, premiums, currency = baseCurrency, limit = 10, onAdd, onDrop, onEdit }: ApplicantFieldsProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const cash = useMoney();

    return (
        <>
            {applicants.map(( person, index ) => (
                <View key={person.key} style={styles.card}>
                    <Surface value="base">
                        <Box row align="center" justify="between" gap="3">
                            <Box row align="center" gap="2">
                                <Text rank="label">{t("checkout.applicantIndex", { index: index + 1 })}</Text>

                                {applicantReady(person) ? (
                                    <Icon name="check" size={theme.icon.sm} tint="success" />
                                ) : null}
                            </Box>

                            <Box row align="center" gap="3">
                                {premiums?.[index] ? (
                                    <Text rank="label" ltr>{cash.amount(premiums[index] ?? 0, currency)}</Text>
                                ) : null}

                                {applicants.length > 1 ? (
                                    <Round icon="trash" tone="danger" look="soft" label={t("cart.remove")} onPress={() => onDrop(person.key) } />
                                ) : null}
                            </Box>
                        </Box>

                        <Field
                            label={t("checkout.applicantName")}
                            icon="account"
                            value={person.name}
                            autoCapitalize="words"
                            autoCorrect={false}
                            onChangeText={( value ) => onEdit(person.key, { name: value }) }
                        />

                        <Field
                            label={t("checkout.applicantBirth")}
                            icon="calendar"
                            value={person.birth}
                            placeholder="YYYY-MM-DD"
                            keyboardType="number-pad"
                            maxLength={10}
                            onChangeText={( value ) => onEdit(person.key, { birth: digits(value) }) }
                        />
                    </Surface>
                </View>
            ))}

            {applicants.length < limit ? (
                <Button label={t("checkout.applicantAdd")} kind="soft" tint="neutral" icon="plus" onPress={onAdd} />
            ) : null}
        </>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        ...theme.depth.flat,
        borderRadius: theme.radius.tile,
        backgroundColor: theme.plane.base,
        gap: theme.space["3"],
        padding: theme.space["4"],
    },

}));
