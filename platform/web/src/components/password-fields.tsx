"use client";

import PasswordField from "@/components/password-field";
import Stack from "@/elements/stack";
import { useTranslations } from "@/lib/providers/intl";

type Props = {
    password: string; confirm: string; hint: string; errors: Record<string, string>; disabled?: boolean;
    id: ( field: string ) => string;
    onChange: ( patch: { password?: string; confirm?: string } ) => void;
};

export default function PasswordFields ({ password, confirm, hint, errors, disabled, id, onChange }: Props) {

    const t = useTranslations("auth");

    return (

        <Stack gap={5}>

            <PasswordField
                id={id("password")} label={t("newPassword")} autoComplete="new-password"
                value={password} hint={hint} error={errors.password} disabled={disabled}
                onChange={( event ) => onChange({ password: event.target.value })}
            />

            <PasswordField
                id={id("confirm")} label={t("confirm")} autoComplete="new-password"
                value={confirm} error={errors.confirm} disabled={disabled}
                onChange={( event ) => onChange({ confirm: event.target.value })}
            />

        </Stack>

    );

}
