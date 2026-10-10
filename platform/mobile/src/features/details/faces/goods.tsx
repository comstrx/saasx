import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Strip } from "@/components/strip";
import { Chip } from "@/elements/chip";
import { Divider } from "@/elements/divider";
import { Icon } from "@/elements/icon";
import { Price } from "@/elements/price";
import { Spec } from "@/elements/spec";
import { Status } from "@/elements/status";
import { Stepper } from "@/elements/stepper";
import { Text } from "@/elements/text";
import type { DeckProps } from "@/features/details/faces/props";
import { DeckCard, DeckStack } from "@/features/details/faces/shell";
import { traitText } from "@/features/details/lang";
import { useMoney } from "@/features/shell/hooks/use-money";
import { can, marked, stockOf } from "@/model/detail";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

const low = 5;

export function GoodsDeck ({ detail, picked, quantity, onPick, onQuantity }: DeckProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const money = useMoney();

    const count = ( value: number ) => formatNumber(i18n.language, value);
    const seat = detail.sellables.find(( row ) => row.id === picked );
    const price = seat?.price ?? detail.price;
    const sale = marked(price, detail.offer);
    const stock = can(detail, "stockable") ? stockOf(detail, picked) : null;
    const available = stock === null || stock > 0;
    const bounds = [ detail.maxQuantity, stock ?? 0 ].filter(( value ) => value > 0 );
    const ceiling = bounds.length > 0 ? Math.min(...bounds) : Number.MAX_SAFE_INTEGER;
    const badge = detail.features.find(( row ) => row.key === "condition" );

    return (
        <DeckStack>
            <DeckCard>
                <View style={{ gap: theme.space["4"] }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: theme.space["3"] }}>
                        <View style={{ gap: theme.space["1"], flexShrink: 1 }}>
                            {price && price.amount > 0
                                ? <Price amount={money.amount(( sale ?? price ).amount, price.currency)} was={sale ? money.amount(price.amount, price.currency) : undefined} rank="figure" />
                                : <Text rank="title">{t("listing.onRequest")}</Text>}

                            <Text rank="caption" ink="soft">{t("details.crown.perUnit")}</Text>
                        </View>

                        {badge ? <Status label={traitText(badge, t, i18n.language) || badge.label} tint="success" /> : null}
                    </View>

                    {stock !== null ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["2"] }}>
                        <Icon
                            name={stock > 0 ? "checkCircle" : "alert"}
                            size={theme.icon.md}
                            tint={stock === 0 ? "danger" : stock <= low ? "warning" : "success"}
                        />

                        <Text
                            rank="label"
                            tint={stock === 0 ? "danger" : stock <= low ? "warning" : "success"}
                            numberOfLines={1}
                            style={{ flexShrink: 1 }}
                        >
                            {stock === 0
                                ? t("details.face.goods.gone")
                                : stock <= low
                                ? t("details.face.goods.left", { value: count(stock) })
                                : t("details.face.goods.plenty")}
                        </Text>
                    </View>
                    ) : null}

                    {available ? (
                        <>
                            <Divider />

                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.space["3"] }}>
                                <Text rank="label">{t("details.face.goods.quantity")}</Text>

                                <Stepper value={quantity} min={detail.minQuantity || 1} max={ceiling} onChange={onQuantity} />
                            </View>
                        </>
                    ) : null}
                </View>
            </DeckCard>

            {detail.sellables.length > 1 ? (
                <View style={{ gap: theme.space["3"] }}>
                    <Text rank="label">{t("details.pick.goods")}</Text>

                    <Strip gap="2">
                        {detail.sellables.map(( row ) => (
                            <Chip
                                key={row.id}
                                label={row.name}
                                live={row.id === picked}
                                disabled={row.soldOut}
                                onPress={() => onPick(row.id) }
                            />
                        ))}
                    </Strip>
                </View>
            ) : null}

            <DeckCard>
                <View style={{ gap: theme.space["1"] }}>
                    {detail.delivery ? (
                        <Spec
                            icon={detail.digital ? "download" : "luggage"}
                            label={t("details.specs.delivery")}
                            value={t(`details.specs.way.${ detail.delivery }`, { defaultValue: detail.delivery })}
                            mark="brand"
                        />
                    ) : null}

                    {detail.maxQuantity > 0 ? (
                        <Spec
                            icon="archiveBox"
                            label={t("details.specs.limit")}
                            value={t("details.specs.limitBody", { count: detail.maxQuantity, value: count(detail.maxQuantity) })}
                        />
                    ) : null}

                    {detail.sku ? <Spec icon="qr" label={t("details.specs.sku")} value={detail.sku} /> : null}

                    <Spec icon="shield" label={t("details.face.goods.secure")} mark="success" />
                </View>
            </DeckCard>
        </DeckStack>
    );

}
