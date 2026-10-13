"use client";

import { useId, useState } from "react";
import Button from "@/elements/button";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Input from "@/elements/input";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Labels = { code: string; submit: string; back: string; sent: string };
type Props = { labels: Labels; busy: boolean; error?: string | undefined; onSubmit: ( code: string ) => void; onBack: () => void };

export default function CodeForm ({ labels, busy, error, onSubmit, onBack }: Props) {
    const id = useId();
    const [code, setCode] = useState("");

    return (

        <Form name="code" onSubmit={() => onSubmit(code.trim())}>

            <Stack gap={3}>

                <Text text={labels.sent} tone="muted" size="sm" />

                <Field id={`${id}-code`} label={labels.code} error={error}>

                    <Input id={`${id}-code`} name="otp" kind="text" value={code} autoComplete="one-time-code" invalid={Boolean(error)} onChange={setCode} />

                </Field>

                <Stack direction="row" gap={2} align="between">

                    <Button label={labels.back} tone="ghost" onPress={onBack} />

                    <Button label={labels.submit} type="submit" busy={busy} />

                </Stack>

            </Stack>

        </Form>

    );
}
