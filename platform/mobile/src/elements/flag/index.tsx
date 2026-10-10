import { Image } from "expo-image";
import { View } from "react-native";
import { flags } from "@/elements/flag/flags";
import { useTheme } from "@/theme/use-theme";

type FlagShape = "rect" | "circle";

type FlagProps = {
    iso: string;
    width?: number | undefined;
    shape?: FlagShape | undefined;
    raised?: boolean | undefined;
};

export function Flag ({ iso, width = 30, shape = "rect", raised = false }: FlagProps) {

    const theme = useTheme();
    const source = flags[iso.toLowerCase()];

    const box = shape === "circle"
        ? { width, height: width, borderRadius: width / 2 }
        : { width, height: Math.round(width / 1.5), borderRadius: theme.radius.tag };

    if ( !source ) return <View style={[ box, { backgroundColor: theme.name === "dark" ? theme.plane.raised : theme.plane.well } ]} />;

    return (
        <View style={[ box, {
            backgroundColor: theme.plane.base,
            boxShadow: raised ? theme.composition.flag.shadow[theme.name === "dark" ? "night" : "day"] : theme.depth.flat.boxShadow,
        } ]}>
            <Image
                source={source}
                style={[ box, shape === "rect" ? { borderWidth: theme.stroke.thin, borderColor: theme.line.soft } : null ]}
                contentFit="cover"
                transition={0}
            />
        </View>
    );

}
