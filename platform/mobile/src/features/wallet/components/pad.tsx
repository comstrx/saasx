import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";
import { Box } from "@/elements/box";
import { Chip } from "@/elements/chip";
import { Text } from "@/elements/text";
import { Input, Shell, useInputFont, Well } from "@/elements/well";
import { formatNumber, symbolLeads } from "@/std/number";
import { str } from "@/std/str";

type PadProps = {
    value: string;
    onChange: ( value: string ) => void;
    symbol: string;
    quick: readonly number[];
    note?: string | undefined;
    error?: string | undefined;
};

const decimal = ( value: string ): string => {

    const clean = str.digits(value).replace(/[^\d.]/g, "");
    const [ whole = "", ...fractions ] = clean.split(".");

    return fractions.length > 0 ? `${whole}.${fractions.join("")}` : whole;

};

export function Pad ({ value, onChange, symbol, quick, note, error }: PadProps) {

    const { t, i18n } = useTranslation();
    const first = symbolLeads(symbol) && !I18nManager.isRTL;
    const figure = useInputFont("title", true);
    const mark = <Text rank="title" ink="soft">{symbol}</Text>;

    return (
        <Box gap="4">
            <Well error={error} hint={note}>
                <Shell state={error ? "error" : "idle"}>
                    {first ? mark : null}

                    <Input
                        value={value}
                        onChangeText={( next ) => onChange(decimal(next)) }
                        placeholder="0"
                        keyboardType="decimal-pad"
                        inputMode="decimal"
                        accessibilityLabel={t("wallet.amount")}
                        style={figure}
                    />

                    {first ? null : mark}
                </Shell>
            </Well>

            <Box align="stretch" row gap="2">
                {quick.map(( amount ) => (
                    <Chip
                        key={amount}
                        block
                        label={formatNumber(i18n.language, amount)}
                        live={value === String(amount)}
                        onPress={() => onChange(String(amount)) }
                    />
                ))}
            </Box>
        </Box>
    );

}
