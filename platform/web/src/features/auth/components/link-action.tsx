"use client";

import AuthOutcome from "@/components/auth-outcome";
import FormAction from "@/components/form-action";
import FormFeedback from "@/components/form-feedback";
import FormLinks from "@/components/form-links";
import FormPanel from "@/components/form-panel";
import { useTranslations } from "@/lib/providers/intl";
import type { AuthLinks } from "../hooks/use-auth-exit";
import { useLinkAction } from "../hooks/use-link-action";

type Props = { mode: "confirm" | "callback"; value: string; refused: boolean; art: string; links: AuthLinks };

export default function LinkAction ({ mode, value, refused, art, links }: Props) {

    const t = useTranslations("auth");
    const state = useLinkAction(mode, value, refused, links);

    if ( state.done ) return (

        <AuthOutcome title={t("emailConfirmed")} message={t("emailConfirmedBody")} art={art} links={[
            { label: t("signIn"), href: state.exit.login },
        ]} />

    );

    return (

        <FormPanel
            title={t(mode === "confirm" ? "confirmEmail" : "socialFinishing")} art={art}
            description={mode === "confirm" && !state.expired ? t("confirmEmailBody") : undefined}
            footer={<FormLinks links={[{ label: t("signIn"), href: state.exit.login }]} />}
        >

            <FormFeedback
                id="auth-link-feedback" error={state.error}
                message={mode === "callback" && !state.error ? t("signingIn") : null}
            />

            {!state.expired && (mode === "confirm" || state.error) ? (

                <FormAction label={t(mode === "confirm" ? "confirmEmail" : "tryAgain")} onClick={state.submit} pending={state.pending} />

            ) : null}

        </FormPanel>

    );

}
