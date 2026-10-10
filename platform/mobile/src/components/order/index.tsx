import { View } from "react-native";
import { Button } from "@/elements/button";
import { Facts } from "@/elements/facts";
import type { IconName } from "@/elements/icon";
import { Media } from "@/elements/media";
import { Press } from "@/elements/press";
import { Price } from "@/elements/price";
import { Status } from "@/elements/status";
import { Surface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { isolateLtr } from "@/std/bidi";
import type { Picture } from "@/std/picture";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type Deed = {
    key: string;
    label: string;
    tint?: ToneName | undefined;
    onPress?: (() => void) | undefined;
};

type OrderProps = {
    title: string;
    reference: string;
    state: { label: string; tint: ToneName };
    when?: string | undefined;
    place?: string | undefined;
    facts?: readonly ( string | null | undefined )[] | undefined;
    image?: Picture | string | null | undefined;
    icon?: IconName | undefined;
    price?: string | undefined;
    deeds?: readonly Deed[] | undefined;
    onPress?: (() => void) | undefined;
};

export function Order ({ title, reference, state, when, place, facts, image, icon, price, deeds, onPress }: OrderProps) {

    const theme = useTheme();

    return (
        <View style={{ overflow: "hidden", borderRadius: theme.radius.card, backgroundColor: theme.plane.base }}>
            <Surface value="base">
                <Press onPress={onPress} disabled={!onPress} feel="ripple" muted={1} style={{ flexDirection: "row", gap: theme.space["3"], padding: theme.space["3"] }}>
                    <Media source={image} icon={icon} ratio={theme.ratio.square} curve="tile" style={{ width: theme.composition.order.art }} />

                    <View style={{ flex: 1, gap: theme.space["1"] }}>
                        <Text rank="title" numberOfLines={2}>{title}</Text>

                        <Facts items={[ isolateLtr(reference), place, ...( facts ?? [] ), when ]} rank="caption" />

                        <View style={{ flexGrow: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", alignContent: "flex-end", gap: theme.space["2"], paddingTop: theme.space["1"] }}>
                            <Status label={state.label} tint={state.tint} size="sm" />

                            {price ? <View style={{ marginStart: "auto" }}><Price amount={price} rank="title" /></View> : null}
                        </View>
                    </View>
                </Press>

                {deeds?.length ? (
                    <View style={{ flexDirection: "row", gap: theme.space["2"], paddingHorizontal: theme.space["3"], paddingBottom: theme.space["3"] }}>
                        {deeds.map(( deed ) => (
                            <View key={deed.key} style={{ flex: 1 }}>
                                <Button label={deed.label} kind="soft" tint={deed.tint ?? "brand"} onPress={deed.onPress} />
                            </View>
                        ))}
                    </View>
                ) : null}
            </Surface>
        </View>
    );

}
