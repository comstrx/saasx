import { useState } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { Shell, stateOf, useInputFont, Well } from "@/elements/well";
import type { PlaneName } from "@/theme/roles";
import { useScript } from "@/theme/use-script";
import { useTheme } from "@/theme/use-theme";

type TextareaProps = Omit<TextInputProps, "style" | "multiline"> & {
    label?: string | undefined;
    hint?: string | undefined;
    error?: string | undefined;
    rows?: number | undefined;
    limit?: number | undefined;
    required?: boolean | undefined;
    on?: PlaneName | undefined;
};

export function Textarea ({ label, hint, error, rows = 4, limit, required = false, on, value, onFocus, onBlur, editable = true, ...rest }: TextareaProps) {

    const theme = useTheme();
    const script = useScript();
    const font = useInputFont();
    const [ lit, setLit ] = useState(false);
    const state = stateOf(lit, error, editable);
    const line = theme.text.body[script].height;

    return (
        <Well label={label} hint={hint} error={error} required={required} count={limit ? `${ ( value ?? "" ).length }/${ limit }` : undefined}>
            <Shell state={state} on={on} pad={false} style={{ alignItems: "stretch", borderRadius: theme.radius.panel, paddingHorizontal: theme.control.md.pad, paddingVertical: theme.space["3"] }}>
                <TextInput
                    {...rest}
                    value={value}
                    editable={editable}
                    multiline
                    textAlignVertical="top"
                    maxLength={limit}
                    onFocus={( event ) => {

                        setLit(true);
                        onFocus?.(event);

                    }}
                    onBlur={( event ) => {

                        setLit(false);
                        onBlur?.(event);

                    }}
                    placeholderTextColor={theme.ink.faint}
                    selectionColor={theme.tone.brand.base}
                    style={{ flex: 1, minHeight: line * rows, lineHeight: line, ...font, textAlignVertical: "top" }}
                />
            </Shell>
        </Well>
    );

}
