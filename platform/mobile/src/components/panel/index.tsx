import type { ReactNode } from "react";
import { View } from "react-native";
import { Band } from "@/components/band";
import { Box } from "@/elements/box";
import { Divider } from "@/elements/divider";
import { useSurface } from "@/elements/surface";
import { useTheme } from "@/theme/use-theme";

type PanelProps = {
    title?: string | undefined;
    note?: string | undefined;
    action?: string | undefined;
    onAction?: (() => void) | undefined;
    children: ReactNode;
    footer?: ReactNode | undefined;
    picked?: boolean | undefined;
};

export function Panel ({ title, note, action, onAction, children, footer, picked = false }: PanelProps) {

    const theme = useTheme();
    const surface = useSurface();

    return (
        <Box plane={surface === "base" ? "raised" : "base"} depth="flat" curve="panel" style={picked ? { backgroundColor: theme.tone.brand.soft } : undefined}>
            <Box pad="4" gap="4">
                {title ? <Band title={title} note={note} action={action} onAction={onAction} /> : null}
                {children}
            </Box>
            {footer ? (
                <>
                    <Divider />
                    <View style={{ padding: theme.space["4"], gap: theme.space["3"] }}>{footer}</View>
                </>
            ) : null}
        </Box>
    );

}
