import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { usePalette } from "@/styles/palette";

export type Choice = { value: string; label: string };
type Props = { name: string; value: string; choices: readonly Choice[]; disabled?: boolean | undefined; onChange: ( value: string ) => void };

const styles = StyleSheet.create({
    row: { gap: 8, paddingVertical: 4 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
    label: { fontSize: 14 },
    pressed: { opacity: 0.7 },
});

export default function Select ({ name, value, choices, disabled = false, onChange }: Props) {
    const palette = usePalette();

    return (

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} testID={name}>

            {choices.map(( choice ) => {
                const chosen = choice.value === value;

                return (

                    <Pressable
                        key={choice.value || "none"}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: chosen, disabled }}
                        disabled={disabled}
                        onPress={() => onChange(choice.value)}
                        style={( { pressed } ) => [styles.chip, { backgroundColor: chosen ? palette.primary : palette.panel, borderColor: chosen ? palette.primary : palette.line }, pressed && styles.pressed]}
                    >

                        <Text style={[styles.label, { color: chosen ? palette.panel : palette.ink }]}>{choice.label}</Text>

                    </Pressable>

                );
            })}

        </ScrollView>

    );
}
