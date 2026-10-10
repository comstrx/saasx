"use client";

import FormFeedback from "@/components/form-feedback";
import PasswordFields from "@/components/password-fields";
import Button from "@/elements/button";
import Form from "@/elements/form";
import { useTranslations } from "@/lib/providers/intl";

type Props = {
    password: string; confirm: string; passwordHint: string; errors: Record<string, string>; error: string | null;
    pending: boolean; id: ( field: string ) => string; onChange: ( patch: { password?: string; confirm?: string } ) => void;
    onSubmit: () => void;
};

export default function PasswordResetForm ({ password, confirm, passwordHint, errors, error, pending, id, onChange, onSubmit }: Props) {

    const t = useTranslations("auth");

    return (

        <Form noValidate pending={pending} onSubmit={( event ) => { event.preventDefault(); onSubmit(); }}>

            <PasswordFields
                id={id} password={password} confirm={confirm} hint={passwordHint} errors={errors} onChange={onChange} disabled={pending}
            />
            {error ? <FormFeedback id={id("failure")} error={error} /> : null}

            <Button type="submit" width="full" size="large" pending={pending}>

                {t(pending ? "saving" : "savePassword")}

            </Button>

        </Form>

    );

}
