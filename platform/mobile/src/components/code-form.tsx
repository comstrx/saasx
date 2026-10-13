import { useState } from "react";
import Button from "@/elements/button";
import Field from "@/elements/field";
import Input from "@/elements/input";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Labels = { code: string; submit: string; back: string; sent: string };
type Props = { labels: Labels; busy: boolean; error?: string | undefined; onSubmit: ( code: string ) => void; onBack: () => void };

export default function CodeForm ({ labels, busy, error, onSubmit, onBack }: Props) {

    const [code, setCode] = useState("");
    const submit = (): void => onSubmit(code.trim());

    return (

        <Stack gap={3}>

            <Text text={labels.sent} tone="muted" size="sm" />

            <Field label={labels.code} error={error}>

                <Input name="otp" kind="code" value={code} invalid={Boolean(error)} onChange={setCode} onSubmit={submit} />

            </Field>

            <Stack direction="row" gap={2} align="between">

                <Button label={labels.back} tone="ghost" onPress={onBack} />

                <Button label={labels.submit} busy={busy} onPress={submit} />

            </Stack>

        </Stack>

    );

}
