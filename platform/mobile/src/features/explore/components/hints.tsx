import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Divider } from "@/elements/divider";
import { chevronNext, Icon, type IconName } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import type { SearchHint } from "@/model/search";
import { useTheme } from "@/theme/use-theme";

type SearchHintsProps = {
    items: readonly SearchHint[];
    onPick: ( hint: SearchHint ) => void;
};

const glyphs: Record<string, IconName> = {
    geo: "location",
    category: "sections",
    catalog: "search",
};

export function SearchHints ({ items, onPick }: SearchHintsProps) {

    const { t } = useTranslation();
    const theme = useTheme();

    const shown = items.slice(0, 6);

    if ( shown.length === 0 ) return null;

    return (
        <Box style={styles.card}>
            {shown.map(( item, index ) => (
                <Box key={`${ item.kind }-${ item.id }`}>
                    {index > 0 ? <Divider /> : null}

                    <Press
                        style={styles.row}
                        onPress={() => onPick(item) }
                        sink="tile"
                        accessibilityRole="button"
                        accessibilityLabel={item.label}
                    >
                        <Plate look="quiet" icon={glyphs[item.kind] ?? "search"} size={theme.control.sm.height} />

                        <Box gap="0" style={styles.copy}>
                            <Text rank="body" numberOfLines={1}>{item.label}</Text>
                            <Text rank="micro" ink="soft" numberOfLines={1}>
                                {t(`search.hint.${ item.kind }`, { defaultValue: t("search.hint.catalog") })}
                            </Text>
                        </Box>

                        <Icon name={chevronNext} size={theme.icon.sm} tint="faint" />
                    </Press>
                </Box>
            ))}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        ...theme.card,
        overflow: "hidden",
        paddingHorizontal: theme.space["4"],
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        paddingVertical: theme.space["3"],
    },
    copy: {
        flex: 1,
    },

}));
