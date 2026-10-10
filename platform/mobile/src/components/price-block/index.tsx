import { View } from "react-native";
import { Divider } from "@/elements/divider";
import { Price } from "@/elements/price";
import { Spec } from "@/elements/spec";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

export type PriceLine = {
    key: string;
    label: string;
    amount: string;
    note?: string | undefined;
    off?: boolean | undefined;
};

type PriceBlockProps = {
    lines: readonly PriceLine[];
    total: string;
    totalLabel: string;
    note?: string | undefined;
};

export function PriceBlock ({ lines, total, totalLabel, note }: PriceBlockProps) {

    const theme = useTheme();

    return (
        <View style={{ gap: theme.space["3"] }}>
            {lines.map(( line ) => (
                <Spec
                    key={line.key}
                    label={line.label}
                    note={line.note}
                    trailing={<Price amount={line.amount} rank="label" tint={line.off ? "success" : "base"} />}
                />
            ))}

            <Divider />

            <Spec
                label={totalLabel}
                strong
                trailing={<Price amount={total} rank="price" />}
            />

            {note ? <Text rank="note" ink="faint">{note}</Text> : null}
        </View>
    );

}
