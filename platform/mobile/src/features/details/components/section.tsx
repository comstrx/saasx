import type { ReactNode } from "react";
import { View } from "react-native";
import { Band } from "@/components/band";
import { Button } from "@/elements/button";
import { Divider } from "@/elements/divider";
import { useTheme } from "@/theme/use-theme";

type DetailSectionProps = {
    title?: string | undefined;
    body?: string | undefined;
    children: ReactNode;
    action?: string | undefined;
    onAction?: (() => void) | undefined;
};

export function DetailSection ({ title, body, children, action, onAction }: DetailSectionProps) {

    const theme = useTheme();

    return (
        <View style={{ paddingHorizontal: theme.layout.gutter }}>
            <Divider />

            <View style={{ paddingVertical: theme.composition.detail.section, gap: theme.space["5"] }}>
                {title ? <Band title={title} note={body} /> : null}
                {children}
                {action && onAction ? <Button label={action} kind="soft" tint="neutral" onPress={onAction} /> : null}
            </View>
        </View>
    );

}
