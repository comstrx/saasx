import { Text as Native, StyleSheet } from "react-native";
import { usePalette } from "@/styles/palette";

type Props = { text: string; tone?: "default" | "muted" | "danger" | "success" | "inverse" | undefined; size?: "sm" | "md" | "lg" | undefined };

const styles = StyleSheet.create({
    sm: { fontSize: 13, lineHeight: 18 },
    md: { fontSize: 15, lineHeight: 21 },
    lg: { fontSize: 17, lineHeight: 23, fontWeight: "600" },
});

export default function Text ({ text, tone = "default", size = "md" }: Props) {

    const palette = usePalette();
    const colors = { default: palette.ink, muted: palette.muted, danger: palette.danger, success: palette.success, inverse: palette.panel };

    return <Native style={[styles[size], { color: colors[tone] }]}>{text}</Native>;

}
