import type { ReactNode } from "react";
import { Modal, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Dock } from "@/elements/dock";
import { useBars } from "@/elements/hooks/use-bars";
import { ModalHeader } from "@/elements/modal-header";
import { Surface } from "@/elements/surface";
import { useTheme } from "@/theme/use-theme";

type FullscreenTone = "surface" | "stage";

type FullscreenProps = {
    open: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
    footer?: ReactNode | undefined;
    action?: ReactNode | undefined;
    scroll?: boolean | undefined;
    padded?: boolean | undefined;
    packed?: boolean | undefined;
    tone?: FullscreenTone | undefined;
};

export function Fullscreen ({ open, title, children, onClose, footer, action, scroll = true, padded = true, packed = false, tone = "surface" }: FullscreenProps) {

    styles.useVariants({ tone });

    const theme = useTheme();
    const stage = tone === "stage";
    const shown = useBars(open, stage || theme.name === "dark" ? "light" : "dark");

    const body = scroll
        ? <ScrollView style={styles.fill} contentContainerStyle={[ styles.content, packed && styles.packed, !padded && styles.flush ]} showsVerticalScrollIndicator={false}>{children}</ScrollView>
        : <View style={styles.fill}>{children}</View>;

    return (
        <Modal visible={shown} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
            <View style={styles.safe}>
                <View style={styles.body}>
                    <Surface value={stage ? "stage" : "canvas"}>
                        <ModalHeader title={title} onBack={onClose} action={action} stage={stage} />

                        {body}

                        {footer ? <Dock inline>{footer}</Dock> : <View style={styles.navBar} pointerEvents="none" />}
                    </Surface>
                </View>
            </View>
        </Modal>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    safe: {
        flex: 1,
        paddingTop: runtime.insets.top,
        variants: {
            tone: {
                surface: { backgroundColor: theme.plane.canvas },
                stage: { backgroundColor: theme.plane.stage },
            },
        },
    },
    body: {
        flex: 1,
        variants: {
            tone: {
                surface: { backgroundColor: theme.plane.canvas },
                stage: { backgroundColor: theme.plane.stage },
            },
        },
    },
    fill: {
        flex: 1,
    },
    navBar: {
        position: "absolute",
        insetInlineStart: 0,
        insetInlineEnd: 0,
        bottom: 0,
        height: runtime.insets.bottom,
        variants: {
            tone: {
                surface: { backgroundColor: theme.plane.canvas },
                stage: { backgroundColor: theme.plane.stage },
            },
        },
    },
    content: {
        flexGrow: 1,
        gap: theme.space["6"],
        paddingHorizontal: theme.layout.gutter,
        paddingBottom: runtime.insets.bottom + theme.space["8"],
    },
    packed: {
        gap: theme.space["3"],
    },
    flush: {
        paddingHorizontal: 0,
        paddingTop: 0,
    },

}));
