"use client";

import { useId } from "react";
import Button from "@/elements/button";
import Field from "@/elements/field";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useCopyValue } from "@/hooks/use-copy-value";
import { usePasswordField } from "@/hooks/use-password-field";
import Icon from "@/icons/icon";

type Props = {
    value: string; label: string; hint: string; reveal: string; copy: string; copied: string; failed: string;
};

export default function AccessCode ({ value, label, hint, reveal, copy, copied, failed }: Props) {

    const id = useId();
    const state = usePasswordField();
    const clipboard = useCopyValue(value);

    return (

        <Stack gap={3}>

            <Field
                id={id} label={label} hint={hint} value={value} readOnly autoComplete="off" dir="ltr"
                type={state.shown ? "text" : "password"}
                end={<Button variant="ghost" aria-label={reveal} aria-pressed={state.shown} onClick={state.toggle}>
                    <Icon name={state.shown ? "eye-off" : "eye"} />
                </Button>}
            />
            <Stack direction="row" gap={3} align="center" wrap>

                <Button variant="outlined" onClick={clipboard.copy}><Icon name="copy" size="sm" />{copy}</Button>
                <Text size="small" tone={clipboard.status === "failed" ? "danger" : "muted"} role="status">
                    {clipboard.status === "copied" ? copied : clipboard.status === "failed" ? failed : null}
                </Text>

            </Stack>

        </Stack>

    );

}
