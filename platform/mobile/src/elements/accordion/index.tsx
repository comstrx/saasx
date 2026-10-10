import { type ReactNode, useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { Icon } from "@/elements/icon";
import { Reveal, useEase } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type AccordionProps = {
    title: string;
    children: ReactNode;
    note?: string | undefined;
    open?: boolean | undefined;
    onToggle?: (( next: boolean ) => void) | undefined;
};

export function Accordion ({ title, children, note, open, onToggle }: AccordionProps) {

    const theme = useTheme();
    const [ own, setOwn ] = useState(false);
    const shown = open ?? own;

    const turn = useEase("transform", theme.beat.base);

    const flip = () => {

        const next = !shown;

        setOwn(next);
        onToggle?.(next);

    };

    return (
        <View>
            <Press
                accessibilityRole="button"
                accessibilityState={{ expanded: shown }}
                onPress={flip}
                feel="dim"
            >
                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["3"], paddingVertical: theme.space["4"] }}>
                    <View style={{ flex: 1, gap: theme.space["1"] }}>
                        <Text rank="label">{title}</Text>
                        {note ? <Text rank="note" ink="faint">{note}</Text> : null}
                    </View>

                    <Animated.View style={{ transform: [ { rotate: shown ? "180deg" : "0deg" } ], ...turn }}>
                        <Icon name="down" size={theme.icon.md} tint="soft" />
                    </Animated.View>
                </View>
            </Press>

            <Reveal open={shown}>
                <View style={{ paddingBottom: theme.space["4"] }}>{children}</View>
            </Reveal>
        </View>
    );

}
