import type { ReactNode } from "react";
import { View } from "react-native";
import { arrowNext } from "@/elements/icon";
import { Round } from "@/elements/round";
import { Text } from "@/elements/text";
import { useScript } from "@/theme/use-script";
import { useTheme } from "@/theme/use-theme";

type BandProps = {
    title: string;
    note?: string | undefined;
    action?: string | undefined;
    onAction?: (() => void) | undefined;
    minor?: boolean | undefined;
    children?: ReactNode | undefined;
};

export function Band ({ title, note, action, onAction, minor = false, children }: BandProps) {

    const theme = useTheme();
    const script = useScript();
    const rank = minor ? "section" : "heading";
    const spill = ( theme.control.md.height - theme.text[rank][script].height ) / 2;
    const lift = theme.space["1"];

    return (
        <View style={{ gap: theme.space["4"] }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["3"] }}>
                <View style={{ flex: 1, gap: theme.space["1"] }}>
                    <Text rank={rank} numberOfLines={2}>{title}</Text>
                    {note ? <Text rank="caption" ink="soft">{note}</Text> : null}
                </View>

                {action ? (
                    <View style={{ marginTop: -spill - lift, marginBottom: -spill + lift }}>
                        <Round icon={arrowNext} onPress={onAction} look="plain" label={action} />
                    </View>
                ) : null}
            </View>

            {children ? <View style={{ gap: theme.layout.stack }}>{children}</View> : null}
        </View>
    );

}
