import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { usePalette } from "@/styles/palette";

type Props = { children: ReactNode; onPress?: (() => void) | undefined };

const styles = StyleSheet.create({ card: { gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 }, pressed: { opacity: 0.85 } });

export default function Card ({ children, onPress }: Props) {
    const palette = usePalette();
    const look = { backgroundColor: palette.panel, borderColor: palette.line };

    if ( onPress ) return <Pressable testID="card" onPress={onPress} style={( { pressed } ) => [styles.card, look, pressed && styles.pressed]}>{children}</Pressable>;

    return <View testID="card" style={[styles.card, look]}>{children}</View>;
}
