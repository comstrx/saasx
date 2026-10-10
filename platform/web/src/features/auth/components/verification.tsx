"use client";

import AuthOutcome from "@/components/auth-outcome";
import FormPanel from "@/components/form-panel";
import VerificationForm from "@/components/verification-form";
import { useTranslations } from "@/lib/providers/intl";
import type { Challenge } from "@/lib/std/auth";
import type { AuthLinks } from "../hooks/use-auth-exit";
import { useVerification } from "../hooks/use-verification";

type Props = { challenge: Challenge; origin: "login" | "register" | "recover"; links: AuthLinks; art: string; onRestart: () => void };

export default function Verification ({ challenge, origin, links, art, onRestart }: Props) {

    const t = useTranslations("auth");
    const state = useVerification(challenge, origin, links);

    if ( state.done ) return (

        <AuthOutcome title={t("passwordDone")} message={t("passwordSaved")} art={art} links={[
            { label: t("signIn"), href: state.exit.login },
        ]} />

    );

    return (

        <FormPanel title={t("otpTitle")} art={art}>

            <VerificationForm
                challenge={state.otp.challenge} values={state.form.values} errors={state.form.errors}
                passwordHint={state.passwordHint} recovery={origin === "recover"} expired={state.otp.expired}
                retry={state.otp.retry} resent={state.otp.resent} pending={state.pending} resending={state.otp.resending}
                error={state.error} id={state.form.id} onChange={state.form.change} onSubmit={state.submit}
                onResend={state.again} onRestart={onRestart}
            />

        </FormPanel>

    );

}
