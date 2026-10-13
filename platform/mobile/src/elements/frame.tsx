import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "@/lib/providers/safe-area";
import type { Palette } from "@/styles/theme";

type Props = { palette: Palette; header?: ReactNode; tabs?: ReactNode; children: ReactNode; direction: "ltr" | "rtl" };

const styles = StyleSheet.create({
    frame: { flex: 1 },
    body: { flexGrow: 1 },
});

export default function Frame ({ palette, header, tabs, children, direction }: Props) {

    return (

        <SafeAreaView style={[styles.frame, { backgroundColor: palette.body, direction }]}>

            {header ? <View>{header}</View> : null}

            <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>

            {tabs ? <View>{tabs}</View> : null}

        </SafeAreaView>

    );

}
