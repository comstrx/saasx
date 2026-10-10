import type { ReactNode } from "react";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Text } from "@/elements/text";

type SectionProps = {
    title: string;
    note?: string | undefined;
    action?: string | undefined;
    onAction?: (() => void) | undefined;
    children?: ReactNode | undefined;
};

export function Section ({ title, note, action, onAction, children }: SectionProps) {

    return (
        <Box gap="3">
            <Box row align="center" justify="between" gap="3">
                <Box flex={1} gap="1">
                    <Text rank="title" numberOfLines={0} accessibilityRole="header">{title}</Text>
                    {note ? <Text rank="caption" ink="soft">{note}</Text> : null}
                </Box>
                {action ? <Button label={action} kind="ghost" compact block={false} onPress={onAction} /> : null}
            </Box>
            {children}
        </Box>
    );

}
