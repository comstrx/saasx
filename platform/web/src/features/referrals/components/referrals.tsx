"use client";

import FormRetry from "@/components/form-retry";
import PromotionLinks from "@/components/promotion-links";
import ReferralBoard from "@/components/referral-board";
import ReferralDetails from "@/components/referral-details";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import { useTranslations } from "@/lib/providers/intl";
import { useReferrals } from "../hooks/use-referrals";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: { login: string; art: string; invite: string; landing: string };
};

export default function Referrals ({ title, description, icon, tone, links }: Props) {

    const state = useReferrals(links.login);
    const { t } = state;
    const common = useTranslations("common");

    if ( !state.ready ) return <SectionSkeleton />;

    if ( !state.token ) return (

        <SignInPrompt
            level={1} title={title} description={t("signInBody")} href={state.login} label={t("signIn")} art={links.art}
        />

    );

    return (

        <SettingsLayout title={title} description={description} icon={icon} tone={tone}>

            {state.failed ? <FormRetry id="referrals-failure" message={t("unavailable")} label={common("retry")} onRetry={state.reload} />
                : state.loading ? <SectionSkeleton /> : (

                    <ReferralBoard
                        art={links.invite} code={state.code} link={state.link} copied={state.copied} busy={state.busy}
                        shares={state.shares} items={state.items} loading={state.listLoading}
                        labels={{
                            title: t("title"), body: t("body"), code: t("code"), copy: t("copy"), copied: t("copiedShort"),
                            share: t("share"),
                            friends: t("friends"), count: t("count", { count: state.total }), active: t("active"), inactive: t("inactive"),
                            remove: t("remove"), emptyTitle: t("emptyTitle"), emptyBody: t("emptyBody"), noCode: t("noCode"),
                        }}
                        onCopy={( value ) => { void state.copy(value); }}
                        onRemove={( id ) => { void state.drop(id); }}
                        onOpen={state.setOpened} selection={state.selection} bulk={state.bulk}
                    />

                )}

            <ReferralDetails
                referralId={state.opened} onClose={() => state.setOpened(null)} onRemove={( id ) => { void state.drop(id); }}
            />

            <PromotionLinks landing={links.landing} art={links.invite} labels={state.promotionLabels} />

        </SettingsLayout>

    );

}
