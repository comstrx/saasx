import { iconGlyph, iconMirrored } from "engine/world";
import { I18nManager, StyleSheet, Text } from "react-native";
import { usePalette } from "@/styles/palette";

type Props = {
    name: string;
    label?: string | undefined;
    size?: "sm" | "md" | undefined;
    tone?: "ink" | "muted" | "primary" | "inverse" | undefined;
};

const sizes = { sm: 16, md: 20 } as const;
const styles = StyleSheet.create({
    icon: { fontFamily: "lucide", includeFontPadding: false, textAlignVertical: "center" },
    mirror: { transform: [{ scaleX: -1 }] },
});

export default function Icon ({ name, label, size = "md", tone = "ink" }: Props) {

    const palette = usePalette();
    const colors = { ink: palette.ink, muted: palette.muted, primary: palette.primary, inverse: palette.panel };
    const side = sizes[size];
    const mirror = I18nManager.isRTL && iconMirrored(name);

    return (

        <Text
            style={[styles.icon, { fontSize: side, lineHeight: side, color: colors[tone] }, mirror && styles.mirror]}
            accessibilityElementsHidden={!label}
            importantForAccessibility={label ? "yes" : "no-hide-descendants"}
            {...(label ? { accessibilityLabel: label, accessibilityRole: "image" as const } : {})}
        >

            {iconGlyph(name)}

        </Text>

    );

}
