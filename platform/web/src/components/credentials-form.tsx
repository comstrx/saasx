"use client";

import { useId, useState } from "react";
import Button from "@/elements/button";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Input from "@/elements/input";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

export type Credentials = { email: string; password: string };

type Labels = { email: string; password: string; submit: string };
type Props = {
    labels: Labels;
    busy: boolean;
    errors: Partial<Record<keyof Credentials | "_form", string>>;
    onSubmit: ( value: Credentials ) => void;
};

export default function CredentialsForm ({ labels, busy, errors, onSubmit }: Props) {

    const id = useId();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (

        <Form name="credentials" onSubmit={() => onSubmit({ email: email.trim(), password })}>

            <Stack gap={3}>

                <Field id={`${id}-email`} label={labels.email} error={errors.email}>

                    <Input
                        id={`${id}-email`}
                        name="email"
                        kind="email"
                        value={email}
                        autoComplete="email"
                        invalid={Boolean(errors.email)}
                        onChange={setEmail}
                    />

                </Field>

                <Field id={`${id}-password`} label={labels.password} error={errors.password}>

                    <Input
                        id={`${id}-password`}
                        name="password"
                        kind="password"
                        value={password}
                        autoComplete="current-password"
                        invalid={Boolean(errors.password)}
                        onChange={setPassword}
                    />

                </Field>

                {errors._form ? <Text text={errors._form} tone="danger" size="sm" /> : null}

                <Button label={labels.submit} type="submit" busy={busy} />

            </Stack>

        </Form>

    );

}
