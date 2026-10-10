"use client";

import AuthOutcome from "@/components/auth-outcome";
import FormFeedback from "@/components/form-feedback";
import FormPanel from "@/components/form-panel";
import FormRetry from "@/components/form-retry";
import PasswordResetForm from "@/components/password-reset-form";
import { useTranslations } from "@/lib/providers/intl";
import type { AuthLinks } from "../hooks/use-auth-exit";
import { useReset } from "../hooks/use-reset";

type Props = { token: string; title: string; art: string; links: AuthLinks };

export default function Reset ({ token, title, art, links }: Props) {

    const t = useTranslations("auth");
    const state = useReset(token, links);

    if ( state.done || state.invalid ) return (

        <AuthOutcome
            title={t(state.done ? "passwordDone" : "resetInvalidTitle")} message={t(state.done ? "passwordSaved" : "resetInvalid")}
            art={art} links={[{
                label: t(state.done ? "signIn" : "recoverTitle"), href: state.done ? state.exit.login : state.exit.recover,
            }]}
        />

    );

    return (

        <FormPanel title={title} art={art}>

            {state.checking ? <FormFeedback id="reset-check" message={t("checkingLink")} /> : state.failed ? (

                <FormRetry id="reset-failure" message={state.error ?? t("unavailable")} label={t("tryAgain")} onRetry={state.reload} />

            ) : (

                <PasswordResetForm
                    password={state.form.values.password} confirm={state.form.values.confirm} passwordHint={state.passwordHint}
                    errors={state.form.errors} error={state.error} pending={state.pending} id={state.form.id}
                    onChange={state.form.change} onSubmit={state.submit}
                />

            )}

        </FormPanel>

    );

}
