"use client";

import AuthOutcome from "@/components/auth-outcome";
import CredentialsForm from "@/components/credentials-form";
import FormAction from "@/components/form-action";
import FormLinks from "@/components/form-links";
import FormPanel from "@/components/form-panel";
import SocialSignIn from "@/components/social-sign-in";
import { useTranslations } from "@/lib/providers/intl";
import type { AuthLinks } from "../hooks/use-auth-exit";
import { useAuthForm } from "../hooks/use-auth-form";
import Verification from "./verification";

type Props = {
    mode: "login" | "register" | "recover"; title: string; description: string;
    art: string; country: string; callback: string; links: AuthLinks;
};

export default function Credentials ({ mode, title, description, art, country, callback, links }: Props) {

    const t = useTranslations("auth");
    const state = useAuthForm(mode, links, country);

    if ( state.challenge ) return (

        <Verification challenge={state.challenge} origin={mode} links={links} art={art} onRestart={state.restart} />

    );
    if ( state.linkSent !== null ) return (

        <AuthOutcome
            title={t("checkEmail")} art={art}
            message={t("linkSent", { destination: `\u2068${state.linkSent}\u2069` })}
            links={[{ label: t("signIn"), href: state.exit.login }]}
            action={<FormAction label={t("changeIdentity")} onClick={state.restart} />}
        />

    );

    return (

        <FormPanel
            title={title} description={description} art={art}
            footer={(

                <FormLinks prompt={mode === "login" ? t("noAccount") : t("haveAccount")} links={[
                    { label: t(mode === "login" ? "register" : "signIn"), href: mode === "login" ? state.exit.register : state.exit.login },
                ]} />

            )}
        >

            <CredentialsForm
                mode={mode} values={state.form.values} errors={state.form.errors} pending={state.pending}
                error={state.error} passwordHint={state.passwordHint} recover={state.exit.recover}
                id={state.form.id} onChange={state.form.change} onSubmit={state.submit}
            />

            {mode !== "recover" ? <SocialSignIn callback={callback} next={state.exit.next} disabled={state.pending} /> : null}

        </FormPanel>

    );

}
