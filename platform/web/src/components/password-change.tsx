"use client";

import FormFeedback from "@/components/form-feedback";
import PasswordField from "@/components/password-field";
import PasswordFields from "@/components/password-fields";
import Button from "@/elements/button";
import Check from "@/elements/check";
import Form from "@/elements/form";
import Text from "@/elements/text";
import { usePasswordChange } from "@/hooks/use-password-change";

type Props = { allowed: boolean };

export default function PasswordChange ({ allowed }: Props) {

    const data = usePasswordChange(allowed);
    const { t } = data;

    return (

        <Form pending={data.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void data.submit(); }}>

            <PasswordField id={data.id("old_password")} label={t("currentPassword")} autoComplete="current-password"
                value={data.values.old_password} error={data.errors.old_password} disabled={data.disabled}
                onChange={( event ) => data.change({ old_password: event.target.value })} />
            <PasswordFields id={data.id} password={data.values.password} confirm={data.values.confirm}
                errors={data.errors} hint={data.hint} disabled={data.disabled} onChange={data.change} />
            <Check id={data.id("logout")} label={t("logoutOthers")} checked={data.logout}
                disabled={data.disabled} onChange={data.setLogout} />
            {data.uncertain ? <Text size="small" tone="muted">{t("uncertainPassword")}</Text> : null}
            <FormFeedback id={data.id("failure")} error={data.error} />
            <FormFeedback id={data.id("status")} message={data.success ? t("passwordSaved") : null} />
            <Button type="submit" pending={data.pending} disabled={!allowed}>

                {t(data.pending ? "saving" : data.uncertain ? "retry" : "changePassword")}

            </Button>

        </Form>

    );

}
