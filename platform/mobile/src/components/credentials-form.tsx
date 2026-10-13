import { useState } from "react";
import Button from "@/elements/button";
import Field from "@/elements/field";
import Input from "@/elements/input";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

export type Credentials = { email: string; password: string };

type Labels = { email: string; password: string; submit: string };
type Props = { labels: Labels; busy: boolean; errors: Partial<Record<keyof Credentials | "_form", string>>; onSubmit: ( value: Credentials ) => void };

export default function CredentialsForm ({ labels, busy, errors, onSubmit }: Props) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const submit = (): void => onSubmit({ email: email.trim(), password });

    return (

        <Stack gap={3}>

            <Field label={labels.email} error={errors.email}>

                <Input name="email" kind="email" value={email} invalid={Boolean(errors.email)} onChange={setEmail} />

            </Field>

            <Field label={labels.password} error={errors.password}>

                <Input name="password" kind="password" value={password} invalid={Boolean(errors.password)} onChange={setPassword} onSubmit={submit} />

            </Field>

            {errors._form ? <Text text={errors._form} tone="danger" size="sm" /> : null}

            <Button label={labels.submit} busy={busy} onPress={submit} />

        </Stack>

    );

}
