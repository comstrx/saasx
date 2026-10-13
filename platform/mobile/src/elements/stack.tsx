import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = { gap?: 1 | 2 | 3 | 4 | 6 | undefined; direction?: "column" | "row" | undefined; align?: "start" | "center" | "end" | "stretch" | "between" | undefined; children: ReactNode };

const gaps = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24 } as const;
const styles = StyleSheet.create({
    column: { flexDirection: "column" },
    row: { flexDirection: "row", alignItems: "center" },
    start: { alignItems: "flex-start" },
    center: { alignItems: "center" },
    end: { alignItems: "flex-end" },
    stretch: { alignItems: "stretch" },
    between: { justifyContent: "space-between" },
});

export default function Stack ({ gap = 3, direction = "column", align = "stretch", children }: Props) {

    return <View style={[styles[direction], styles[align], { gap: gaps[gap] }]}>{children}</View>;

}
