import { type ReactNode, useState } from "react";
import { View } from "react-native";
import { arrowBack } from "@/elements/icon";
import { useLabels } from "@/elements/labels";
import { Round } from "@/elements/round";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type ModalHeaderProps = {
    title?: string | undefined;
    onBack?: (() => void) | undefined;
    action?: ReactNode;
    stage?: boolean | undefined;
};

export function ModalHeader ({ title, onBack, action, stage = false }: ModalHeaderProps) {

    const theme = useTheme();
    const labels = useLabels();
    const [ actionWidth, setActionWidth ] = useState(0);
    const [ cramped, setCramped ] = useState<string | null>(null);
    const back = onBack ? theme.control.md.height : 0;
    const side = Math.max(back, action ? actionWidth : 0);
    const gap = side > 0 ? theme.space["3"] : 0;
    const wide = Boolean(action) && actionWidth > back;
    const shifted = wide && cramped === title;

    return (
        <View style={{ minHeight: theme.control.md.height, justifyContent: "center", marginHorizontal: theme.layout.gutter, marginTop: theme.space["4"], marginBottom: theme.space["2"] }}>
            <Text
                rank="title"
                align={shifted ? "start" : "center"}
                tint={stage ? "on" : undefined}
                numberOfLines={shifted ? 1 : 2}
                onTextLayout={wide && !shifted ? ( event ) => { if ( event.nativeEvent.lines.length > 1 ) setCramped(title ?? null); } : undefined}
                style={shifted ? { paddingStart: back + theme.space["3"], paddingEnd: actionWidth + theme.space["3"] } : { paddingHorizontal: side + gap }}
            >
                {title}
            </Text>
            {onBack ? (
                <View style={{ position: "absolute", insetInlineStart: 0 }}>
                    <Round icon={arrowBack} look={stage ? "glass" : "plain"} onPress={onBack} label={labels.back} />
                </View>
            ) : null}
            {action ? (
                <View onLayout={( event ) => setActionWidth(event.nativeEvent.layout.width)} style={{ position: "absolute", insetInlineEnd: 0 }}>
                    {action}
                </View>
            ) : null}
        </View>
    );

}
