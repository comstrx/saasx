"use client";

import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import { type AccountOptions, useAccountEntry } from "../hooks/use-account";
import AccountDetails from "./details";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    options: AccountOptions;
};

export default function Account ({ title, description, icon, tone, options }: Props) {

    const data = useAccountEntry(options);

    if ( data.ready && !data.token ) return <SignInPrompt
        level={1} title={title} description={data.t("signInBody")} href={data.login} label={data.t("signIn")}
    />;

    return (

        <SettingsLayout title={title} description={description} icon={icon} tone={tone}>

            {data.ready && data.token
                ? <AccountDetails key={data.token} view={options.view} login={data.login}
                    recover={data.recover} country={options.country} files={options.files} />
                : <SectionSkeleton />}

        </SettingsLayout>

    );

}
