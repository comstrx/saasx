import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { Check } from "@/elements/check";
import type { IconName } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type Rail = {
    key: string;
    label: string;
    note?: string | undefined;
    icon: IconName;
    image?: string | null | undefined;
    initial?: string | undefined;
    tint?: ToneName | undefined;
    disabled?: boolean | undefined;
};

type RailsProps = {
    rails: readonly Rail[];
    picked: string;
    onPick: ( key: string ) => void;
};

function Mark ({ rail }: { rail: Rail }) {

    const theme = useTheme();
    const [ broken, setBroken ] = useState(false);
    const [ loaded, setLoaded ] = useState(false);
    const size = theme.control.sm.height;
    const tone = rail.tint ?? "brand";

    const fallback = rail.initial ? (
        <Plate tone={tone} look="quiet" size={size}>
            <Text rank="label" color={theme.tone[tone].onSoft} ltr>{rail.initial}</Text>
        </Plate>
    ) : <Plate icon={rail.icon} tone={tone} look="quiet" size={size} />;

    return (
        <View style={{ width: size, height: size, borderRadius: theme.radius.tag, overflow: "hidden" }}>
            {!loaded || broken ? fallback : null}
            {rail.image && !broken ? (
                <Image source={rail.image} style={{ position: "absolute", inset: 0, width: size, height: size }} contentFit="contain" onLoad={() => setLoaded(true)} onError={() => setBroken(true)} />
            ) : null}
        </View>
    );

}

export function Rails ({ rails, picked, onPick }: RailsProps) {

    const theme = useTheme();

    return (
        <View style={{ gap: theme.space["3"] }}>
            {rails.map(( rail ) => {

                const live = rail.key === picked;

                return (
                    <Press
                        key={rail.key}
                        accessibilityRole="radio"
                        accessibilityLabel={rail.label}
                        accessibilityState={{ selected: live, disabled: Boolean(rail.disabled) }}
                        onPress={rail.disabled ? undefined : () => onPick(rail.key)}
                        disabled={rail.disabled}
                        muted={rail.disabled ? theme.state.numb : 1}
                        sink="tile"
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: theme.space["3"],
                                padding: theme.space["4"],
                                borderRadius: theme.radius.card,
                                backgroundColor: live ? theme.tone.brand.soft : theme.plane.base,
                            }}
                        >
                            <Mark key={rail.image ?? rail.key} rail={rail} />

                            <View style={{ flex: 1, gap: theme.space["1"] }}>
                                <Text rank="label">{rail.label}</Text>
                                {rail.note ? <Text rank="note" ink="faint">{rail.note}</Text> : null}
                            </View>

                            <Check on={live} round size={theme.toggle.check} />
                        </View>
                    </Press>
                );

            })}
        </View>
    );

}
