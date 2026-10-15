import { StyleSheet, Switch, Text, View } from "react-native";
import { useFont } from "@/styles/font";
import { usePalette } from "@/styles/palette";

type Props = { name: string; label: string; checked: boolean; disabled?: boolean | undefined; onChange: ( value: boolean ) => void };

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 44 }, label: { fontSize: 15, flex: 1 } });

export default function Checkbox ({ name, label, checked, disabled = false, onChange }: Props) {

    const palette = usePalette();
    const font = useFont();

    return (

        <View style={styles.row}>

            <Text style={[font, styles.label, { color: palette.ink }]}>{label}</Text>

            <Switch testID={name} accessibilityLabel={label} value={checked} disabled={disabled} onValueChange={onChange} trackColor={{ true: palette.primary, false: palette.line }} />

        </View>

    );

}
