import { StyleSheet, TextInput } from "react-native";
import { usePalette } from "@/styles/palette";

type Props = { name: string; kind?: "text" | "email" | "password" | "search" | "code" | "number" | "date" | "phone" | undefined; value: string; placeholder?: string | undefined; invalid?: boolean | undefined; disabled?: boolean | undefined; onChange: ( value: string ) => void; onSubmit?: (() => void) | undefined };

const styles = StyleSheet.create({ input: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, fontSize: 15 } });
const kinds = {
    text: { keyboardType: "default", secureTextEntry: false, autoCapitalize: "sentences", textContentType: "none" },
    email: { keyboardType: "email-address", secureTextEntry: false, autoCapitalize: "none", textContentType: "emailAddress" },
    password: { keyboardType: "default", secureTextEntry: true, autoCapitalize: "none", textContentType: "password" },
    search: { keyboardType: "default", secureTextEntry: false, autoCapitalize: "none", textContentType: "none" },
    code: { keyboardType: "number-pad", secureTextEntry: false, autoCapitalize: "none", textContentType: "oneTimeCode" },
    number: { keyboardType: "numeric", secureTextEntry: false, autoCapitalize: "none", textContentType: "none" },
    date: { keyboardType: "numbers-and-punctuation", secureTextEntry: false, autoCapitalize: "none", textContentType: "none" },
    phone: { keyboardType: "phone-pad", secureTextEntry: false, autoCapitalize: "none", textContentType: "telephoneNumber" },
} as const;

export default function Input ({ name, kind = "text", value, placeholder, invalid = false, disabled = false, onChange, onSubmit }: Props) {
    const palette = usePalette();

    return (

        <TextInput
            testID={name}
            accessibilityLabel={placeholder ?? name}
            style={[styles.input, { backgroundColor: palette.panel, color: palette.ink, borderColor: invalid ? palette.danger : palette.line, opacity: disabled ? 0.6 : 1 }]}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={palette.muted}
            editable={!disabled}
            onChangeText={onChange}
            onSubmitEditing={onSubmit}
            autoCorrect={false}
            {...kinds[kind]}
        />

    );
}
