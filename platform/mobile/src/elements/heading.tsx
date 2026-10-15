import { StyleSheet, Text } from "react-native";
import { useFont } from "@/styles/font";
import { usePalette } from "@/styles/palette";

type Props = { level: 1 | 2 | 3; text: string };

const styles = StyleSheet.create({
    heading: { fontWeight: "700", marginBottom: 12 },
    one: { fontSize: 26, lineHeight: 32 },
    two: { fontSize: 21, lineHeight: 27 },
    three: { fontSize: 17, lineHeight: 23 },
});
const sizes = { 1: styles.one, 2: styles.two, 3: styles.three } as const;

export default function Heading ({ level, text }: Props) {

    const palette = usePalette();
    const font = useFont();

    return <Text accessibilityRole="header" style={[font, styles.heading, sizes[level], { color: palette.ink }]}>{text}</Text>;

}
