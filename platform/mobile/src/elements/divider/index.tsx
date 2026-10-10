import { View } from "react-native";
import type { Step } from "@/elements/box";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type DividerProps = {
    vertical?: boolean | undefined;
    inset?: Step | undefined;
    strong?: boolean | undefined;
    tone?: ToneName | undefined;
};

export function Divider ({ vertical = false, inset, strong = false, tone }: DividerProps) {

    const theme = useTheme();
    const paint = tone ? theme.tone[tone].line : strong ? theme.line.soft : theme.line.hair;
    const gap = inset === undefined ? 0 : theme.space[inset];

    if ( vertical ) return <View style={{ width: theme.stroke.hair, alignSelf: "stretch", marginVertical: gap, backgroundColor: paint }} />;

    return <View style={{ height: theme.stroke.hair, marginStart: gap, backgroundColor: paint }} />;

}
