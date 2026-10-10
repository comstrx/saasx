import { type Ref, useState } from "react";
import { Pressable, TextInput, type TextInputProps } from "react-native";
import { Icon, type IconName } from "@/elements/icon";
import { Spinner } from "@/elements/spinner";
import { Shell, stateOf, useInputFont, Well } from "@/elements/well";
import type { PlaneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type FieldProps = Omit<TextInputProps, "style"> & {
    label?: string | undefined;
    hint?: string | undefined;
    error?: string | undefined;
    icon?: IconName | undefined;
    action?: IconName | undefined;
    onAction?: (() => void) | undefined;
    actionLabel?: string | undefined;
    required?: boolean | undefined;
    done?: boolean | undefined;
    loading?: boolean | undefined;
    ltr?: boolean | undefined;
    on?: PlaneName | undefined;
    ref?: Ref<TextInput> | undefined;
};

export function Field ({ label, hint, error, icon, action, onAction, actionLabel, required = false, done = false, loading = false, ltr = false, on, ref, onFocus, onBlur, editable = true, ...rest }: FieldProps) {

    const theme = useTheme();
    const font = useInputFont("body", ltr);
    const [ lit, setLit ] = useState(false);
    const state = stateOf(lit, error, editable, done);

    return (
        <Well label={label} hint={hint} error={error} required={required}>
            <Shell state={state} on={on}>
                {icon ? <Icon name={icon} size={theme.icon.md} tint={lit ? "brand" : "faint"} /> : null}

                <TextInput
                    {...rest}
                    ref={ref}
                    editable={editable}
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
                    style={{ flex: 1, ...font }}
                />

                {loading ? <Spinner size={theme.icon.md} /> : null}

                {done && !action && !loading ? <Icon name="checkCircle" size={theme.icon.md} tint="success" /> : null}

                {action ? (
                    <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} hitSlop={theme.hit.slop}>
                        <Icon name={action} size={theme.icon.md} tint="faint" />
                    </Pressable>
                ) : null}
            </Shell>
        </Well>
    );

}
