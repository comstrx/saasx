import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = { name: string; fill?: boolean | undefined; children: ReactNode };

const styles = StyleSheet.create({ section: { gap: 4 }, fill: { flex: 1 } });

export default function Section ({ name, fill = false, children }: Props) {

    return <View testID={name} style={[styles.section, fill && styles.fill]}>{children}</View>;

}
