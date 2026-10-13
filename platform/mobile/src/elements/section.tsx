import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = { name: string; children: ReactNode };

const styles = StyleSheet.create({ section: { gap: 4 } });

export default function Section ({ name, children }: Props) {
    return <View testID={name} style={styles.section}>{children}</View>;
}
