import { useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import { Text } from "@/elements/text";
import type { InkName } from "@/theme/roles";
import type { RankName } from "@/theme/text";
import { useTheme } from "@/theme/use-theme";

type FactsProps = {
    items: readonly ( string | null | undefined )[];
    rank?: RankName | undefined;
    ink?: InkName | undefined;
};

export function Facts ({ items, rank = "caption", ink = "soft" }: FactsProps) {

    const theme = useTheme();
    const kept = items.filter(( item ): item is string => Boolean(item?.trim()) );
    const [ lines, setLines ] = useState<readonly number[]>([]);

    if ( kept.length === 0 ) return null;

    const seat = theme.space["4"];

    const place = ( index: number ) => ( event: LayoutChangeEvent ) => {

        const y = Math.round(event.nativeEvent.layout.y);

        setLines(( current ) => {

            if ( current[index] === y ) return current;

            const next = [ ...current ];
            next[index] = y;

            return next;

        });

    };

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", rowGap: theme.space["1"], columnGap: seat }}>
            {kept.map(( item, index ) => (
                <View key={item} onLayout={place(index)} style={{ maxWidth: "100%" }}>
                    {index > 0 && lines[index] !== undefined && lines[index] === lines[index - 1] ? (
                        <Text rank={rank} ink="faint" align="center" style={{ position: "absolute", start: -seat, width: seat }}>·</Text>
                    ) : null}

                    <Text rank={rank} ink={ink}>{item}</Text>
                </View>
            ))}
        </View>
    );

}
