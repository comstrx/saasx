"use client";

import ConfirmationPreference from "@/components/confirmation-preference";
import DangerZone from "@/components/danger-zone";
import FormSection from "@/components/form-section";
import LinkedAccounts from "@/components/linked-accounts";
import PasswordChange from "@/components/password-change";
import SessionManager from "@/components/session-manager";
import SignInLock from "@/components/sign-in-lock";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useTranslations } from "@/lib/providers/intl";

type Props = { hasPassword: boolean; allowed: boolean; socials: boolean; recover: string; hasPhone: boolean };

export default function SecuritySettings ({ hasPassword, allowed, socials, recover, hasPhone }: Props) {

    const t = useTranslations("accountSecurity");

    return (

        <Stack gap={6}>

            <FormSection layout="split" title={t("passwordTitle")} description={t("passwordDescription")}>

                {!hasPassword ? <Stack gap={3}>

                    <Text tone="muted" size="small">{t("setPasswordBody")}</Text>
                    <Stack direction="row"><Link href={recover} variant="outlined">{t("setPassword")}</Link></Stack>

                </Stack> : allowed ? <PasswordChange allowed={allowed} /> : (
                    <Text tone="muted" size="small">{t("passwordDenied")}</Text>
                )}

            </FormSection>
            <FormSection layout="split" title={t("confirmationTitle")} description={t("confirmationDescription")}>

                <ConfirmationPreference hasPhone={hasPhone} />

            </FormSection>
            {socials ? <FormSection layout="split" title={t("socialTitle")} description={t("socialDescription")}>

                <LinkedAccounts hasPassword={hasPassword} />

            </FormSection> : null}
            <FormSection layout="split" title={t("sessionsTitle")} description={t("sessionsDescription")}>

                <SessionManager />

                <SignInLock hasPassword={hasPassword} />

            </FormSection>
            <FormSection layout="split" title={t("dangerTitle")} description={t("dangerDescription")}>

                <DangerZone hasPassword={hasPassword} />

            </FormSection>

        </Stack>

    );

}
