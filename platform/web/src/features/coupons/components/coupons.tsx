"use client";

import CouponActions from "@/components/coupon-actions";
import CouponCard from "@/components/coupon-card";
import CouponDetails from "@/components/coupon-details";
import FormRetry from "@/components/form-retry";
import MoneyList from "@/components/money-list";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import TabbedSection from "@/components/tabbed-section";
import VoucherGrid from "@/components/voucher-grid";
import { useTranslations } from "@/lib/providers/intl";
import { useCoupons } from "../hooks/use-coupons";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: { login: string; art: string; empty: string };
};

export default function Coupons ({ title, description, icon, tone, links }: Props) {

    const state = useCoupons(links.login);
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

            <TabbedSection
                label={t("tabsLabel")} tabs={state.tabs} current={state.view} note={{ title: t("howTitle"), body: t("howBody") }}
            >

                {state.failed ? <FormRetry id="coupons-failure" message={t("unavailable")} label={common("retry")} onRetry={state.reload} />
                    : state.loading ? <SectionSkeleton />
                    : state.view === "history" ? state.events.length
                        ? <MoneyList label={t("tabs.history")} items={state.events} currencyLabel="" />
                        : <StateNotice compact art={links.empty} title={t("emptyTitle")} description={t("emptyHistory")} />
                    : state.cards.length ? (

                        <VoucherGrid label={t(`tabs.${state.view}`)}>

                            {state.cards.map(( { key, id, ...coupon } ) => (

                                <CouponCard
                                    key={key} {...coupon}
                                    action={(

                                        <CouponActions
                                            claim={state.view === "available" ? {
                                                claimed: state.claimed.includes(id), disabled: state.pending || coupon.inactive,
                                                labels: { claim: t("claim"), saved: t("saved") }, onClaim: () => { void state.claim(id); },
                                            } : null}
                                            details={{ label: t("details"), onOpen: () => state.setOpened(id) }}
                                        />

                                    )}
                                />

                            ))}

                        </VoucherGrid>

                    ) : (

                        <StateNotice
                            compact art={links.empty} title={t("emptyTitle")}
                            description={t(state.view === "mine" ? "emptyMine" : "emptyAvailable")}
                        />

                    )}

            </TabbedSection>

            <CouponDetails couponId={state.opened} onClose={() => state.setOpened(null)} />

        </SettingsLayout>

    );

}
