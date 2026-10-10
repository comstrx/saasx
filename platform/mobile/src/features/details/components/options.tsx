import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Badge } from "@/elements/badge";
import { Box } from "@/elements/box";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { usePartyText } from "@/features/shell/copy";
import type { Sellable } from "@/model/detail";
import { useTheme } from "@/theme/use-theme";

type OptionsProps = {
    items: readonly Sellable[];
    value: number | null;
    money: ( amount: number, currency: string ) => string;
    onChange: ( id: number ) => void;
};

export function Options ({ items, value, money, onChange }: OptionsProps) {

    const { t } = useTranslation();

    const seats = usePartyText();
    const theme = useTheme();

    return (
        <Box gap="3">
            {items.map(( item ) => {

                const on = item.id === value;
                const dead = item.soldOut || !item.fits;

                return (
                    <Press
                        key={item.id}
                        style={[ styles.row, on && styles.picked, dead && styles.numb ]}
                        onPress={() => onChange(item.id) }
                        disabled={dead}
                        sink="tile"
                        accessibilityRole="radio"
                        accessibilityState={{ selected: on, disabled: dead }}
                    >
                        <Box style={[ styles.mark, on && styles.marked ]} align="center" justify="center">
                            {on ? <Icon name="check" size={theme.icon.xs} tint="lit" /> : null}
                        </Box>

                        <Box style={styles.copy} gap="1">
                            <Text rank="label" numberOfLines={2}>{item.name}</Text>

                            <Box row align="center" gap="2">
                                {item.adults > 0 ? <Text rank="caption" ink="soft">{seats(item.adults, item.children)}</Text> : null}
                                {item.soldOut ? <Badge label={t("details.soldOut")} tint="danger" /> : null}
                            </Box>
                        </Box>

                        {item.price ? <Text rank="label">{money(item.price.amount, item.price.currency)}</Text> : null}
                    </Press>
                );

            })}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        ...theme.depth.flat,
        borderRadius: theme.radius.tile,
        backgroundColor: theme.plane.base,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        padding: theme.space["4"],
    },
    picked: {
        backgroundColor: theme.tone.brand.soft,
    },
    numb: {
        opacity: theme.state.numb,
    },
    mark: {
        width: theme.icon.lg,
        height: theme.icon.lg,
        borderRadius: theme.radius.pill,
        borderWidth: theme.stroke.base,
        borderColor: theme.line.strong,
    },
    marked: {
        borderColor: theme.tone.brand.base,
        backgroundColor: theme.tone.brand.base,
    },
    copy: {
        flex: 1,
    },

}));
