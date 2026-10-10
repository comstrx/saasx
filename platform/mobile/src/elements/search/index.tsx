import { useState } from "react";
import { Pressable, TextInput, type TextInputProps, View } from "react-native";
import { Icon } from "@/elements/icon";
import { useLabels } from "@/elements/labels";
import { Text } from "@/elements/text";
import { Shell, useInputFont } from "@/elements/well";
import type { PlaneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type SearchProps = Omit<TextInputProps, "style"> & {
    value: string;
    onChangeText: ( next: string ) => void;
    on?: PlaneName | undefined;
    tall?: boolean | undefined;
    note?: string | undefined;
    onClear?: (() => void) | undefined;
};

export function Search ({ value, onChangeText, on, tall = false, note, onClear, onFocus, onBlur, placeholder, ...rest }: SearchProps) {

    const theme = useTheme();
    const labels = useLabels();
    const font = useInputFont();
    const [ lit, setLit ] = useState(false);

    const field = (
        <View style={note ? { height: theme.text.body.latin.height, justifyContent: "center" } : { flex: 1, alignSelf: "stretch", justifyContent: "center" }}>
            {value.length === 0 && placeholder ? (
                <View pointerEvents="none" style={{ position: "absolute", start: 0, end: 0 }}>
                    <Text rank="body" ink="faint" numberOfLines={1}>{placeholder}</Text>
                </View>
            ) : null}

            <TextInput
                {...rest}
                value={value}
                onChangeText={onChangeText}
                accessibilityLabel={rest.accessibilityLabel ?? placeholder}
                selectionColor={theme.tone.brand.base}
                returnKeyType="search"
                onFocus={( event ) => {

                    setLit(true);
                    onFocus?.(event);

                }}
                onBlur={( event ) => {

                    setLit(false);
                    onBlur?.(event);

                }}
                style={note ? { ...font, height: theme.text.body.latin.height } : { flex: 1, ...font }}
            />
        </View>
    );

    return (
        <Shell state={lit ? "focus" : "idle"} on={on} tall={tall}>
            <Icon name="search" size={theme.icon.md} tint={lit ? "brand" : "faint"} />

            {note ? (
                <View style={{ flex: 1, paddingVertical: theme.space["2"] }}>
                    {field}
                    <Text rank="note" ink="soft" numberOfLines={1}>{note}</Text>
                </View>
            ) : field}

            {value.length > 0 ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={labels.clear}
                    hitSlop={theme.hit.slop}
                    onPress={() => {

                        onChangeText("");
                        onClear?.();

                    }}
                >
                    <Icon name="close" size={theme.icon.md} tint="faint" />
                </Pressable>
            ) : null}
        </Shell>
    );

}
