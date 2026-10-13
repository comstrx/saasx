import { StyleSheet, View } from "react-native";
import { Path, Svg } from "@/lib/providers/svg";
import { usePalette } from "@/styles/palette";

export type Scene = "empty" | "failed" | "offline" | "denied" | "done";
type Props = { scene: Scene; label?: string | undefined };

const scenes: Record<Scene, { paths: string[]; accent: string[] }> = {
    empty: { paths: ["M14 40h52l-4 18H18z", "M22 40V28a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v12"], accent: ["M34 34h12", "M40 14v8"] },
    failed: { paths: ["M22 50a12 12 0 0 1 2-23.8A16 16 0 0 1 55 24a10 10 0 0 1 3 20"], accent: ["M34 38l12 12", "M46 38L34 50"] },
    offline: { paths: ["M22 46a12 12 0 0 1 2-23.8A16 16 0 0 1 55 20a10 10 0 0 1 3 20"], accent: ["M40 48v14", "M33 55h14", "M34 62h12"] },
    denied: { paths: ["M40 14l22 10v14c0 14-9 24-22 30-13-6-22-16-22-30V24z"], accent: ["M31 40h18", "M40 31v18"] },
    done: { paths: ["M40 14a26 26 0 1 1 0 52 26 26 0 0 1 0-52z"], accent: ["M28 41l8 8 16-18"] },
};
const styles = StyleSheet.create({ frame: { alignItems: "center", paddingVertical: 8 } });

export default function Illustration ({ scene, label }: Props) {
    const palette = usePalette();
    const { paths, accent } = scenes[scene];
    const accentColor: string = (scene === "failed" ? palette.danger : scene === "done" ? palette.success : palette.ink) ?? "currentColor";
    const bodyColor: string = (scene === "denied" ? palette.danger : palette.primary) ?? "currentColor";
    const fill: string = palette.line ?? "transparent";

    return (

        <View style={styles.frame} accessibilityLabel={label} accessibilityElementsHidden={!label}>

            <Svg width={96} height={96} viewBox="0 0 80 80">

                {paths.map(( d ) => <Path key={d} d={d} stroke={bodyColor} strokeWidth={2.5} fill={fill} strokeLinejoin="round" strokeLinecap="round" />)}

                {accent.map(( d ) => <Path key={d} d={d} stroke={accentColor} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />)}

            </Svg>

        </View>

    );
}
