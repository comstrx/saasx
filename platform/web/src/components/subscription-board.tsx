"use client";

import FormFeedback from "@/components/form-feedback";
import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import SubscriptionCard from "@/components/subscription-card";
import SubscriptionPay from "@/components/subscription-pay";
import SubscriptionReview from "@/components/subscription-review";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string; description: string; icon?: string | null; tone?: Tone;
    links: { login: string; plans: string; art: string; empty: string };
};

export default function SubscriptionBoard ({ title, description, icon, tone, links }: Props) {

    const data = useSubscriptions(links);
    const common = useTranslations("common");
    const { t, asked } = data;

    if ( !data.ready ) return <SectionSkeleton />;

    if ( !data.token ) return (

        <SignInPrompt level={1} title={title} description={t("signInBody")} href={data.login} label={t("signIn")} art={links.art} />

    );

    return (

        <SettingsLayout title={title} description={description} icon={icon} tone={tone}>

            <Stack gap={6}>

                {data.failed ? (

                    <FormRetry id="subscriptions-read" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />

                ) : null}

                {data.loading ? <SectionSkeleton /> : null}

                {!data.loading && !data.failed && !data.items.length ? (

                    <StateNotice
                        art={links.empty}
                        title={t("emptyTitle")}
                        description={t("emptyBody")}
                        action={(

                            <Link href={data.plans} variant="filled" size="medium" shape="pill">

                                <Icon name="crown" />{t("browsePlans")}

                            </Link>

                        )}
                    />

                ) : null}

                {data.items.length ? (

                    <Stack as="ul" gap={4} aria-label={title}>

                        {data.items.map(( item ) => (

                            <SubscriptionCard
                                key={item.id}
                                item={item}
                                toggling={data.toggling === item.id}
                                onToggle={( value ) => { void data.toggle(item.id, value); }}
                                onPay={() => data.ask("pay", item)}
                                onReview={() => data.ask("review", item)}
                                onCancel={() => data.ask("cancel", item)}
                            />

                        ))}

                    </Stack>

                ) : null}

                {data.items.length ? (

                    <Stack direction="row" justify="center">

                        <Link href={data.plans} variant="outlined" size="medium" shape="pill">

                            <Icon name="crown" />{t("comparePlans")}

                        </Link>

                    </Stack>

                ) : null}

            </Stack>

            <SubscriptionPay
                subscriptionId={asked?.kind === "pay" ? asked.id : null}
                name={asked?.name ?? ""}
                onClose={() => data.setAsked(null)}
                onDone={() => { data.setAsked(null); data.reload(); }}
            />

            <SubscriptionReview
                subscriptionId={asked?.kind === "review" ? asked.id : null}
                name={asked?.name ?? ""}
                onClose={() => data.setAsked(null)}
                onDone={() => data.setAsked(null)}
            />

            <Dialog
                open={asked?.kind === "cancel"}
                onOpenChange={( open ) => { if ( !open && !data.cancelling ) data.setAsked(null); }}
                title={t("cancelTitle", { plan: asked?.name ?? "" })}
                close={t("close")}
                dismissible={!data.cancelling}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.cancelling} onClick={() => data.setAsked(null)}>{t("keep")}</Button>

                        <Button variant="danger" pending={data.cancelling} onClick={() => { void data.confirmCancel(); }}>

                            {t("confirmCancel")}

                        </Button>

                    </>

                )}
            >

                <Stack gap={4}>

                    <Text tone="muted" wrap="pretty">{t("cancelBody")}</Text>

                    <FormFeedback id="subscription-cancel-failure" error={data.cancelError} />

                </Stack>

            </Dialog>

        </SettingsLayout>

    );

}
