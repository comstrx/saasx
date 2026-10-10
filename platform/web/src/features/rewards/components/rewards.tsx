"use client";

import CouponActions from "@/components/coupon-actions";
import CouponCard from "@/components/coupon-card";
import FormRetry from "@/components/form-retry";
import LevelDetails from "@/components/level-details";
import LoyaltyCard from "@/components/loyalty-card";
import MoneyList from "@/components/money-list";
import RewardDetails from "@/components/reward-details";
import Section from "@/components/section";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import VoucherGrid from "@/components/voucher-grid";
import { useTranslations } from "@/lib/providers/intl";
import { useRewards } from "../hooks/use-rewards";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: { login: string; art: string; level: string; empty: string };
};

export default function Rewards ({ title, description, icon, tone, links }: Props) {

    const state = useRewards(links.login);
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

            {state.failed ? <FormRetry id="rewards-failure" message={t("unavailable")} label={common("retry")} onRetry={state.reload} />
                : state.loading ? <SectionSkeleton /> : (

                    <LoyaltyCard
                        art={links.level} points={state.points} level={state.level} next={state.next} ladder={state.ladder}
                        labels={{
                            yourLevel: t("yourLevel"), points: t("points"), perks: t("perksTitle"),
                            next: t("nextTitle", { name: state.next?.name ?? "" }),
                            nextBody: t("nextBody"), ladder: t("ladder"), current: t("current"),
                        }}
                        onLevel={( key ) => state.setLevel(Number(key))}
                    />

                )}

            <Section title={t("earn")} description={t("earnBody")}>

                {state.listLoading ? <SectionSkeleton /> : state.rewards.length ? (

                    <VoucherGrid label={t("earn")}>

                        {state.rewards.map(( { key, id, ...reward } ) => (

                            <CouponCard
                                key={key}
                                {...reward}
                                action={<CouponActions details={{ label: t("details"), onOpen: () => state.setReward(id) }} />}
                            />

                        ))}

                    </VoucherGrid>

                ) : <StateNotice compact art={links.empty} title={t("earn")} description={t("emptyRewards")} />}

            </Section>

            <Section title={t("history")}>

                {state.history.length ? <MoneyList label={t("history")} items={state.history} currencyLabel="" />
                    : <StateNotice compact title={t("history")} description={t("emptyHistory")} />}

            </Section>

            <LevelDetails levelId={state.levelId} art={links.level} onClose={() => state.setLevel(null)} />

            <RewardDetails rewardId={state.rewardId} onClose={() => state.setReward(null)} />

        </SettingsLayout>

    );

}
