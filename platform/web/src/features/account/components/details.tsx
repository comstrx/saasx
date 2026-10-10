"use client";

import AccountAddress from "@/components/account-address";
import AccountFiles from "@/components/account-files";
import AvatarEditor from "@/components/avatar-editor";
import DisplayPreferences from "@/components/display-preferences";
import FormRetry from "@/components/form-retry";
import FormSection from "@/components/form-section";
import IdentityVerification from "@/components/identity-verification";
import NotificationPreferences from "@/components/notification-preferences";
import ProfileName from "@/components/profile-name";
import ProfileOverview from "@/components/profile-overview";
import SectionSkeleton from "@/components/section-skeleton";
import SecuritySettings from "@/components/security-settings";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import { useTranslations } from "@/lib/providers/intl";
import { useAccount } from "../hooks/use-account";

type Props = { view: string; login: string; recover: string; country: string; files: string };

export default function AccountDetails ({ view, login, recover, country, files }: Props) {

    const t = useTranslations("account");
    const common = useTranslations("common");
    const { request, user } = useAccount();

    if ( request.error?.status === 401 ) return <SignInPrompt
        title={t("expiredTitle")} description={t("signInBody")} href={login} label={t("signIn")}
    />;

    if ( request.error?.status === 403 ) return <StateNotice title={t("deniedTitle")} description={t("deniedBody")} />;

    return (

        <>

            {request.error ? <FormRetry
                id="account-read-failure" message={common("failedBody")} label={common("retry")} onRetry={request.reload}
            /> : null}
            {!user && request.loading ? <SectionSkeleton /> : null}
            {user ? view === "security" ? (

                <SecuritySettings hasPassword={user.has_password === true}
                    allowed={user.permissions?.includes("allow_passwords") === true}
                    socials={user.permissions?.includes("allow_socials") === true} recover={recover} hasPhone={!!user.phone} />

            ) : view === "documents" ? (

                <>

                    {user.permissions?.includes("allow_identities") ? (

                        <FormSection layout="split" title={t("identityTitle")} description={t("identityDescription")}>

                            <IdentityVerification />

                        </FormSection>

                    ) : null}
                    <FormSection layout="split" title={t("filesTitle")} description={t("filesDescription")}>

                        <AccountFiles art={files} />

                    </FormSection>

                </>

            ) : view === "notifications" ? (

                <FormSection layout="split" title={t("notificationsTitle")} description={t("notificationsDescription")}>

                    <NotificationPreferences />

                </FormSection>

            ) : view === "preferences" ? (

                <FormSection layout="split" title={t("displayTitle")} description={t("displayDescription")}>

                    <DisplayPreferences />

                </FormSection>

            ) : (

                <>

                    <FormSection layout="split" title={t("imageTitle")} description={t("imageDescription")}>

                        <AvatarEditor image={user.image} name={user.name ?? ""}
                            allowed={user.permissions?.includes("allow_avatars") === true} />

                    </FormSection>
                    <FormSection layout="split" title={t("nameTitle")} description={t("nameDescription")}>

                        <ProfileName key={user.id} name={user.name ?? ""} />

                    </FormSection>
                    <FormSection layout="split" title={t("addressTitle")} description={t("addressDescription")}>

                        <AccountAddress key={user.id} place={user.geo} />

                    </FormSection>
                    <ProfileOverview email={user.email} phone={user.phone} hasPassword={user.has_password === true}
                        recover={recover} country={user.geo?.country?.code || country}
                        emailVerified={user.email_verified} phoneVerified={user.phone_verified} />

                </>

            ) : null}

        </>

    );

}
