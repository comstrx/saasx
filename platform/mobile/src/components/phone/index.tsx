import { type Ref, useMemo, useState } from "react";
import { Pressable, type TextInput, type TextInputProps, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { type Option, Picker } from "@/components/picker";
import { Flag } from "@/elements/flag";
import { Icon } from "@/elements/icon";
import { Text } from "@/elements/text";
import { Input, Shell, stateOf, Well } from "@/elements/well";
import type { Dial } from "@/std/identity";
import { str } from "@/std/str";
import { useTheme } from "@/theme/use-theme";

type PhoneCopy = {
    title: string;
    hint: string;
    empty: string;
    popular?: string | undefined;
    all?: string | undefined;
};

type PhoneProps = Omit<TextInputProps, "style" | "value" | "onChangeText"> & {
    dials: readonly Dial[];
    iso: string;
    onIso: ( iso: string ) => void;
    value: string;
    onChangeText: ( value: string ) => void;
    picker: PhoneCopy;
    error?: string | undefined;
    ref?: Ref<TextInput> | undefined;
};

export function Phone ({ dials, iso, onIso, value, onChangeText, picker, error, onFocus, onBlur, ref, editable = true, ...rest }: PhoneProps) {

    const theme = useTheme();
    const [ lit, setLit ] = useState(false);
    const [ picking, setPicking ] = useState(false);
    const current = dials.find(( entry ) => entry.iso === iso ) ?? dials[0];

    const options = useMemo<readonly Option[]>(() => dials.map(( entry ) => ({
        key: entry.iso,
        label: entry.label,
        note: entry.dial,
        flag: entry.iso,
        group: entry.popular ? "popular" : "all",
        terms: entry.terms,
    })), [ dials ]);

    return (
        <Well error={error}>
            <View style={styles.row}>
                <Pressable
                    style={styles.country}
                    onPress={() => setPicking(true)}
                    disabled={!editable}
                    accessibilityRole="button"
                    accessibilityLabel={picker.title}
                    accessibilityState={{ disabled: !editable, expanded: picking }}
                >
                    <Shell state={stateOf(lit, error, editable)}>
                        <Flag iso={current?.iso ?? ""} width={theme.icon.lg} shape="circle" />
                        <Text rank="label" ltr>{current?.dial ?? ""}</Text>
                        <Icon name="down" size={theme.icon.sm} />
                    </Shell>
                </Pressable>

                <Shell state={stateOf(lit, error, editable)} style={styles.field}>
                    <Input
                        {...rest}
                        ref={ref}
                        editable={editable}
                        value={value}
                        onChangeText={( next ) => onChangeText(str.digits(next).replace(/\D/g, "")) }
                        onFocus={( event ) => {

                            setLit(true);
                            onFocus?.(event);

                        }}
                        onBlur={( event ) => {

                            setLit(false);
                            onBlur?.(event);

                        }}
                        keyboardType="phone-pad"
                        textContentType="telephoneNumber"
                    />
                </Shell>
            </View>

            <Picker
                open={picking}
                onClose={() => setPicking(false) }
                title={picker.title}
                hint={picker.hint}
                options={options}
                value={iso}
                onPick={( next ) => {

                    onIso(next);
                    setPicking(false);

                }}
                empty={picker.empty}
                groups={picker.popular && picker.all ? { popular: picker.popular, all: picker.all } : undefined}
            />
        </Well>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        flexDirection: "row",
        alignItems: "stretch",
        gap: theme.control.md.gap,
    },
    country: {
        flexShrink: 0,
    },
    field: {
        flex: 1,
        minWidth: 0,
    },

}));
