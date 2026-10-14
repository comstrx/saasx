import { flagEmoji } from "@engine/world";
import { Image, StyleSheet, Text } from "react-native";
import { flagSource, world } from "@/lib/spec/world";

type Props = { code: string; size?: "sm" | "md" | undefined };

const sizes = { sm: { width: 20, height: 15 }, md: { width: 24, height: 18 } } as const;
const styles = StyleSheet.create({ flag: { borderRadius: 2 } });

export default function Flag ({ code, size = "md" }: Props) {

    const source = flagSource(code);
    const country = world.countries.get(code);

    if ( source === undefined || !country ) return <Text accessibilityElementsHidden>{flagEmoji(code)}</Text>;

    return <Image source={source} accessibilityLabel={country.name.en} style={[styles.flag, sizes[size]]} resizeMode="cover" />;

}
