import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Divider } from "@/elements/divider";
import { Icon } from "@/elements/icon";
import { Text } from "@/elements/text";
import { markOf } from "@/features/catalog/marks";
import { traitText } from "@/features/details/lang";
import type { Trait, TraitGroup } from "@/model/detail";
import { useTheme } from "@/theme/use-theme";

function AmenityLine ({ item }: { item: Trait }) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();

    const off = item.included === false;
    const value = traitText(item, t, i18n.language);

    return (
        <Box row align="center" gap="4">
            <Icon name={markOf(item.icon, item.key)} size={theme.icon.xl} tint={off ? "faint" : "base"} />

            <Box style={styles.copy} gap="0">
                <Text rank="body" ink={off ? "faint" : undefined} style={off ? styles.struck : undefined}>{item.label}</Text>
                {value ? <Text rank="caption" ink="soft" numberOfLines={1}>{value}</Text> : null}
            </Box>
        </Box>
    );

}

function AmenityRow ({ item, divided, detailed }: { item: Trait; divided: boolean; detailed: boolean }) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();

    const off = item.included === false;
    const value = traitText(item, t, i18n.language);

    return (
        <Box>
            {divided ? <Divider /> : null}

            <Box style={styles.row(detailed)} row align="center" gap="4">
                <Icon name={markOf(item.icon, item.key)} size={theme.icon.lg} tint={off ? "faint" : "base"} />

                <Box style={styles.copy} gap="1">
                    <Text rank="body" ink={off ? "faint" : undefined} style={off ? styles.struck : undefined}>{item.label}</Text>
                    {detailed && value ? <Text rank="caption" ink="soft">{value}</Text> : null}
                </Box>
            </Box>
        </Box>
    );

}

const preview = 6;

export const groupTitle = ( group: string, t: TFunction ): string =>
    t(`details.amenityGroup.${ group }`, { defaultValue: t("details.amenityGroup.other") });

export function AmenitiesPreview ({ groups, onMore }: { groups: readonly TraitGroup[]; onMore: () => void }) {

    const { t } = useTranslation();

    const items = groups.flatMap(( block ) => block.items.map(( item ) => ({ ...item, slot: `${ block.group }-${ item.key }` }) ) );
    const shown = items.slice(0, preview);

    return (
        <Box gap="5">
            <Box gap="4">
                {shown.map(( item ) => <AmenityLine key={item.slot} item={item} />)}
            </Box>

            {items.length > shown.length ? (
                <Button
                    label={t("details.showAmenities", { count: items.length })}
                    kind="soft" tint="neutral"
                    onPress={onMore}
                />
            ) : null}
        </Box>
    );

}

export function AmenitiesList ({ groups }: { groups: readonly TraitGroup[] }) {

    const { t } = useTranslation();

    return (
        <Box gap="7">
            {groups.map(( block ) => (
                <Box key={block.group} gap="2">
                    <Text rank="title">{groupTitle(block.group, t)}</Text>

                    <Box>
                        {block.items.map(( item, index ) => <AmenityRow key={item.key} item={item} divided={index > 0} detailed />)}
                    </Box>
                </Box>
            ))}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: ( detailed: boolean ) => ({
        minHeight: detailed ? theme.art.sm : theme.hit.min,
        paddingVertical: detailed ? theme.space["2"] : theme.space["1"],
    }),
    struck: {
        textDecorationLine: "line-through",
    },
    copy: {
        flex: 1,
    },

}));
