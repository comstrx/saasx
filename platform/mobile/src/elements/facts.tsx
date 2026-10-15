import { StyleSheet, Text, View } from "react-native";
import { useFont } from "@/styles/font";
import { usePalette } from "@/styles/palette";

type Fact = { key: string; label: string; value: string };
type Props = { facts: readonly Fact[] };

const styles = StyleSheet.create({ facts: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, fact: { minWidth: 140, gap: 2 }, label: { fontSize: 12 }, value: { fontSize: 15 } });

export default function Facts ({ facts }: Props) {

    const palette = usePalette();
    const font = useFont();

    return (

        <View style={styles.facts}>

            {facts.map(( fact ) => (

                <View key={fact.key} style={styles.fact}>

                    <Text style={[font, styles.label, { color: palette.muted }]}>{fact.label}</Text>

                    <Text style={[font, styles.value, { color: palette.ink }]}>{fact.value}</Text>

                </View>

            ))}

        </View>

    );

}
