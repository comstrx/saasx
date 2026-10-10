import type { ReactNode } from "react";
import { StyleSheet } from "react-native-unistyles";
import { AppBar } from "@/elements/app-bar";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";

type CheckoutFrameProps = {
    title: string;
    onBack: () => void;
    footer?: ReactNode;
    children: ReactNode;
};

export function CheckoutFrame ({ title, onBack, footer, children }: CheckoutFrameProps) {

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={title} onBack={onBack} />

            <Scroll docked={Boolean(footer)} contentContainerStyle={styles.stack}>{children}</Scroll>

            {footer}
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    stack: {
        gap: theme.layout.stack,
        paddingHorizontal: theme.layout.gutter,
    },

}));
