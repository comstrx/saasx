import { View } from "react-native";
import { Text } from "@/elements/text";
import type { RankName } from "@/theme/text";
import { useTheme } from "@/theme/use-theme";

type HeadingProps = {
    title: string;
    body?: string | undefined;
    detail?: string | undefined;
    rank?: RankName | undefined;
    look?: "default" | "brief" | undefined;
    align?: "start" | "center" | undefined;
};

export function Heading ({ title, body, detail, rank = "display", look = "default", align: asked }: HeadingProps) {

    const theme = useTheme();
    const brief = look === "brief";
    const align = asked ?? ( brief ? "center" : "start" );

    return (
        <View style={{ alignSelf: "stretch", gap: theme.space[brief ? "2.5" : "2"] }}>
            <Text rank={brief ? "heading" : rank} ink="base" align={align} numberOfLines={brief ? 1 : 0} accessibilityRole="header">{title}</Text>
            {body || detail ? (
                <View style={{ gap: theme.space["1"] }}>
                    {body ? <Text rank={brief ? "description" : "body"} ink={brief ? "base" : "soft"} align={align} numberOfLines={brief ? 1 : undefined}>{body}</Text> : null}
                    {detail ? <Text rank="body" ink="soft" align={align} ltr selectable>{detail}</Text> : null}
                </View>
            ) : null}
        </View>
    );

}
