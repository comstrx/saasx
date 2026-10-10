import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Divider } from "@/elements/divider";
import { Icon } from "@/elements/icon";
import { Media } from "@/elements/media";
import { Text } from "@/elements/text";
import { glyphOf } from "@/features/catalog/marks";
import { CheckoutSection } from "@/features/checkout/components/section";
import { type Detail, favoured, refundable, voiceOf } from "@/model/detail";
import { useTheme } from "@/theme/use-theme";

type CheckoutSummaryProps = {
    detail: Detail;
    sellable: number | undefined;
};

export function CheckoutSummary ({ detail, sellable }: CheckoutSummaryProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const room = detail.sellables.find(( item ) => item.id === sellable );
    const rated = detail.reviews > 0 && detail.rating > 0;

    return (
        <CheckoutSection>
            <Box row align="start" gap="4">
                <Media
                    source={detail.shots[0]?.picture}
                    icon={glyphOf(detail.type)}
                    ratio={null}
                    curve="control"
                    scrim={false}
                    style={styles.media}
                />

                <Box gap="1" style={styles.copy}>
                    <Text rank="title" numberOfLines={2}>{detail.name}</Text>
                    <Text rank="caption" ink="soft" numberOfLines={2}>{room?.name || detail.place}</Text>

                    <Box row wrap align="center" gap="1">
                        {rated ? (
                            <>
                                <Icon name="ratingStar" size={theme.icon.md} tint="star" />
                                <Text rank="title" ltr>{detail.rating.toFixed(1)}</Text>
                                <Text rank="caption" ink="soft" ltr>({detail.reviews})</Text>
                            </>
                        ) : (
                            <>
                                <Icon name="award" size={theme.icon.md} />
                                <Text rank="label">{t("details.fresh")}</Text>
                            </>
                        )}

                        {favoured(detail) ? (
                            <>
                                <Text rank="label" ink="soft">·</Text>
                                <Text rank="label">{t(`details.voice.${ voiceOf(detail) }.guestFavorite`)}</Text>
                            </>
                        ) : null}
                    </Box>
                </Box>
            </Box>

            {refundable(detail) ? (
                <>
                    <Divider />

                    <Box row align="center" gap="4">
                        <Icon name="calendar" size={theme.icon.lg} />

                        <Text rank="label" numberOfLines={2} style={styles.cancel}>
                            {t(`checkout.freeCancellation.${ voiceOf(detail) }`)}
                        </Text>
                    </Box>
                </>
            ) : null}
        </CheckoutSection>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    media: {
        width: theme.art.md,
        height: theme.art.md,
    },
    copy: {
        flex: 1,
    },
    cancel: {
        flex: 1,
        marginBottom: theme.stroke.thin,
    },

}));
