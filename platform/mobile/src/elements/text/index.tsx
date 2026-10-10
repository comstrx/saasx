import { Text as Native, type TextProps as NativeProps } from "react-native";
import { scriptOf } from "@/std/script";
import type { InkName, ToneName } from "@/theme/roles";
import type { RankName } from "@/theme/text";
import { useScript } from "@/theme/use-script";
import { useTheme } from "@/theme/use-theme";

export type TextTint = ToneName | "star" | "on";
type TextAlign = "start" | "end" | "center";

type TextProps = NativeProps & {
    rank?: RankName | undefined;
    ink?: InkName | undefined;
    tint?: TextTint | undefined;
    align?: TextAlign | undefined;
    color?: string | undefined;
    ltr?: boolean | undefined;
    strike?: boolean | undefined;
    underline?: boolean | undefined;
    figures?: boolean | undefined;
};

const flowing: readonly RankName[] = [ "body", "description", "caption", "note", "footnote" ];

const sides: Record<TextAlign, "left" | "right" | "center"> = { start: "left", end: "right", center: "center" };

export function Text ({ rank = "body", ink = "base", tint, align = "start", color, ltr = false, strike = false, underline = false, figures = false, numberOfLines, style, children, ...rest }: TextProps) {

    const theme = useTheme();
    const app = useScript();
    const script = scriptOf(children, app);
    const metric = theme.text[rank][script];

    const tinted = tint === undefined
        ? theme.ink[ink]
        : tint === "star" ? theme.star
            : tint === "on" ? theme.material.lit
                : theme.tone[tint].onSoft;

    return (
        <Native
            textBreakStrategy={align === "center" ? "balanced" : undefined}
            lineBreakStrategyIOS={align === "center" ? "push-out" : undefined}
            {...rest}
            numberOfLines={numberOfLines ?? ( flowing.includes(rank) ? undefined : 1 )}
            style={[ {
                fontFamily: theme.fonts[script][metric.weight],
                fontSize: metric.size,
                lineHeight: metric.height,
                letterSpacing: metric.track,
                color: color ?? tinted,
                textAlign: sides[align],
                includeFontPadding: false,
                ...( figures ? { fontVariant: [ "tabular-nums" as const ] } : {} ),
                ...( ltr ? { writingDirection: "ltr" as const } : {} ),
                ...( underline ? { textDecorationLine: strike ? "underline line-through" as const : "underline" as const } : strike ? { textDecorationLine: "line-through" as const } : {} ),
            }, style ]}
        >
            {children}
        </Native>
    );

}
