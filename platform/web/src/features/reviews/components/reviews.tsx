"use client";

import FormRetry from "@/components/form-retry";
import MoreButton from "@/components/more-button";
import ReviewManager from "@/components/review-manager";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import { useTranslations } from "@/lib/providers/intl";
import { useReviews } from "../hooks/use-reviews";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: { login: string; art: string; empty: string };
};

export default function Reviews ({ title, description, icon, tone, links }: Props) {

    const state = useReviews(links.login);
    const { t } = state;
    const common = useTranslations("common");

    if ( !state.ready ) return <SectionSkeleton />;

    if ( !state.token ) return (

        <SignInPrompt
            level={1} title={title} description={t("signInBody")} href={state.login} label={t("signIn")} art={links.art}
        />

    );

    return (

        <SettingsLayout title={title} description={state.count ?? description} icon={icon} tone={tone}>

            {state.failed ? <FormRetry id="reviews-failure" message={t("unavailable")} label={common("retry")} onRetry={state.reload} />
                : state.loading ? <SectionSkeleton />
                : state.items.length ? (

                    <ReviewManager
                        items={state.items} scope="account.reviews" onChanged={state.reload} selection={state.selection} bulk={state.bulk}
                    />

                )
                : <StateNotice art={links.empty} title={t("emptyTitle")} description={t("emptyBody")} />}

            <MoreButton label={t("more")} onClick={state.more} />

        </SettingsLayout>

    );

}
