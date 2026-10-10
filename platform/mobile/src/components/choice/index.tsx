import type { ReactNode } from "react";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Check } from "@/elements/check";
import { Press } from "@/elements/press";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { above } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type ChoiceProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
    kind?: "check" | "radio";
    trail?: boolean;
    boxed?: boolean;
    count?: number | undefined;
    note?: string | undefined;
    figure?: ReactNode;
};

export function Choice ({ label, selected, onPress, kind = "check", trail = false, boxed = false, count, note, figure }: ChoiceProps) {

    const theme = useTheme();
    const surface = useSurface();
    const mark = <Check on={selected} round={kind === "radio"} />;

    const seat = selected ? theme.tone.brand.soft : theme.plane[above(surface, theme.name === "dark")];

    return (
        <Press
            style={[ styles.row, boxed ? [ styles.boxed, { backgroundColor: seat } ] : null ]}
            onPress={onPress}
            sink="tile"
            accessibilityLabel={[ label, note ].filter(Boolean).join(". ")}
            accessibilityRole={kind === "radio" ? "radio" : "checkbox"}
            accessibilityState={{ selected, checked: selected }}
        >
            {trail ? null : mark}

            {figure ?? null}

            <Box gap="0" style={styles.copy}>
                <Text rank="body">{label}</Text>
                {note ? <Text rank="caption" ink="soft">{note}</Text> : null}
            </Box>

            {count !== undefined ? <Text rank="caption" ink="soft">{count}</Text> : null}

            {trail ? mark : null}
        </Press>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        minHeight: theme.control.md.height,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        paddingVertical: theme.space["1"],
    },
    boxed: {
        padding: theme.space["3"],
        borderRadius: theme.radius.control,
    },
    copy: {
        flex: 1,
    },

}));
