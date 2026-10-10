"use client";

import FormFeedback from "@/components/form-feedback";
import FormRetry from "@/components/form-retry";
import PasswordField from "@/components/password-field";
import PaymentChoices from "@/components/payment-choices";
import SectionSkeleton from "@/components/section-skeleton";
import StateNotice from "@/components/state-notice";
import TaskLayout from "@/components/task-layout";
import Amount from "@/elements/amount";
import Badge from "@/elements/badge";
import Button from "@/elements/button";
import Choices from "@/elements/choices";
import Divider from "@/elements/divider";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Segmented from "@/elements/segmented";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useOnboarding } from "@/hooks/use-onboarding";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import OnboardingVerify from "./onboarding-verify";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string; description: string; icon?: string | null; tone?: Tone;
    links: { workspaces: string; plans: string; login: string; empty: string };
};

export default function WorkspaceOnboarding ({ title, description, icon, tone, links }: Props) {

    const data = useOnboarding(links);
    const common = useTranslations("common");
    const { t, values, errors, summary } = data;
    const steps: ("plan" | "details" | "payment")[] = summary?.free ? ["plan", "details"] : ["plan", "details", "payment"];
    const at = steps.indexOf(data.step === "verify" ? "details" : data.step);

    if ( !data.ready || data.plansLoading ) return <SectionSkeleton />;

    if ( data.plansFailed ) return (

        <FormRetry id="onboarding-plans" message={common("failedBody")} label={common("retry")} onRetry={data.reloadPlans} />

    );

    if ( !data.plans.length ) return <StateNotice art={links.empty} title={t("noPlansTitle")} description={t("noPlansBody")} />;

    const aside = summary ? (

        <Surface padding={6} radius="xl">

            <Stack gap={4}>

                <Stack direction="row" align="center" justify="between" gap={3}>

                    <Heading level={2} size="title">{summary.name}</Heading>

                    {summary.free ? <Badge tone="success">{t("free")}</Badge> : <Badge tone="teal" look="flat">{summary.duration}</Badge>}

                </Stack>

                <Divider />

                <Stack gap={3}>

                    {summary.price ? (

                        <Stack direction="row" justify="between" align="baseline" gap={3}>

                            <Text size="small" tone="muted">{t("planPrice")}</Text>

                            <Stack direction="row" align="baseline" gap={2}>

                                {summary.was ? <Amount {...summary.was} size="small" strike /> : null}

                                <Amount {...summary.price} size="base" />

                            </Stack>

                        </Stack>

                    ) : null}

                    {summary.discount ? (

                        <Stack direction="row" justify="between" align="baseline" gap={3}>

                            <Text size="small" tone="muted">{t("discount")}</Text>

                            <Amount {...summary.discount} size="base" tone="success" />

                        </Stack>

                    ) : null}

                </Stack>

                <Divider />

                <Stack direction="row" justify="between" align="baseline" gap={3}>

                    <Text weight="semibold">{t("dueToday")}</Text>

                    {summary.free || !summary.total ? (

                        <Text weight="bold" size="title">{t("free")}</Text>

                    ) : <Amount {...summary.total} size="large" />}

                </Stack>

                {data.applied ? (

                    <Stack direction="row" align="center" gap={2}>

                        <Icon name="tag" size="sm" tone="success" />

                        <Text size="small" tone="success">{t("couponUsed", { code: data.applied })}</Text>

                    </Stack>

                ) : null}

            </Stack>

        </Surface>

    ) : <SectionSkeleton />;

    return (

        <TaskLayout
            title={title}
            description={description}
            icon={icon}
            tone={tone}
            label={t("summary")}
            back={{ href: data.plansHref, label: t("backToPlans") }}
            progress={{
                label: t("progress"),
                items: steps.map(( key, index ) => ({ key, label: t(`steps.${key}`), state: data.stage(index, at) })),
            }}
            aside={aside}
        >

            <Surface padding={8} radius="xl">

                {data.step === "plan" ? (

                    <Stack gap={6}>

                        <Choices
                            label={t("choosePlan")}
                            labelVisible
                            value={data.planId ? String(data.planId) : ""}
                            options={data.plans.map(( plan ) => ({
                                value: String(plan.id), label: plan.name, detail: plan.description ?? undefined,
                                end: plan.free ? <Badge tone="success" look="flat">{t("free")}</Badge> : undefined,
                            }))}
                            onValueChange={( value ) => data.setPlanId(Number(value))}
                        />

                        <Stack gap={2}>

                            <Text size="small" weight="semibold">{t("billing")}</Text>

                            <Segmented
                                label={t("billing")}
                                value={data.duration}
                                options={data.durations.map(( duration ) => ({ value: duration, label: t(`durations.${duration}`) }))}
                                onValueChange={( value ) => data.setDuration(data.durations.find(( entry ) => entry === value) ?? "yearly")}
                            />

                            {data.unavailable ? <Text size="small" tone="warning">{t("durationUnavailable")}</Text> : null}

                        </Stack>

                        {!summary?.free ? (

                            <Stack direction="row" align="end" gap={2}>

                                <Stack grow>

                                    <Field
                                        id="onboarding-coupon"
                                        label={t("coupon")}
                                        optional={t("optional")}
                                        value={data.code}
                                        dir="ltr"
                                        error={data.couponError ?? undefined}
                                        disabled={data.checking}
                                        onChange={( event ) => data.setCode(event.target.value)}
                                    />

                                </Stack>

                                <Button
                                    variant="outlined"
                                    pending={data.checking}
                                    disabled={!data.code.trim()}
                                    onClick={() => { void data.apply(); }}
                                >

                                    {t("apply")}

                                </Button>

                            </Stack>

                        ) : null}

                        <Stack direction="row" justify="end">

                            <Button size="large" disabled={!data.plan || data.unavailable} onClick={data.next}>

                                {t("continue")}<Icon name="arrow-end" />

                            </Button>

                        </Stack>

                    </Stack>

                ) : data.step === "details" ? (

                    <Form pending={data.pending} noValidate onSubmit={( event ) => { event.preventDefault(); data.next(); }}>

                        <Stack gap={1}>

                            <Heading level={2} size="title">{t("workspaceTitle")}</Heading>

                            <Text size="small" tone="muted">{t("workspaceBody")}</Text>

                        </Stack>

                        <Grid columns={2} mobileColumns={1} gap={4}>

                            <Field
                                id="onboarding-name" label={t("workspaceName")} maxLength={200} value={values.name} error={errors.name}
                                disabled={data.pending} onChange={( event ) => data.change({ name: event.target.value })}
                            />

                            <Field
                                id="onboarding-domain" label={t("domain")} optional={t("optional")} hint={t("domainHint")} dir="ltr"
                                value={values.domain} disabled={data.pending}
                                onChange={( event ) => data.change({ domain: event.target.value })}
                            />

                            <Field
                                id="onboarding-phone" label={t("phone")} optional={t("optional")} type="tel" dir="ltr" autoComplete="tel"
                                value={values.phone} disabled={data.pending}
                                onChange={( event ) => data.change({ phone: event.target.value })}
                            />

                            {data.signed ? (

                                <Field
                                    id="onboarding-contact" label={t("contactEmail")} optional={t("optional")} type="email" dir="ltr"
                                    value={values.email} disabled={data.pending}
                                    onChange={( event ) => data.change({ email: event.target.value })}
                                />

                            ) : null}

                        </Grid>

                        <Divider />

                        <Stack gap={1}>

                            <Heading level={2} size="title">{t(data.signed ? "adminTitle" : "accountTitle")}</Heading>

                            <Text size="small" tone="muted">{t(data.signed ? "adminBody" : "accountBody")}</Text>

                        </Stack>

                        {data.signed ? (

                            <Grid columns={2} mobileColumns={1} gap={4}>

                                <Field
                                    id="onboarding-admin-name" label={t("adminName")} optional={t("optional")} autoComplete="name"
                                    value={values.adminName} disabled={data.pending}
                                    onChange={( event ) => data.change({ adminName: event.target.value })}
                                />

                                <Field
                                    id="onboarding-admin-email" label={t("adminEmail")} type="email" dir="ltr" autoComplete="off"
                                    value={values.adminEmail} error={errors.adminEmail} disabled={data.pending}
                                    onChange={( event ) => data.change({ adminEmail: event.target.value })}
                                />

                                <PasswordField
                                    id="onboarding-admin-password" label={t("adminPassword")} autoComplete="new-password"
                                    value={values.adminPassword} error={errors.adminPassword} disabled={data.pending}
                                    onChange={( event ) => data.change({ adminPassword: event.target.value })}
                                />

                                <PasswordField
                                    id="onboarding-admin-confirm" label={t("confirm")} autoComplete="new-password"
                                    value={values.adminConfirm} error={errors.adminConfirm} disabled={data.pending}
                                    onChange={( event ) => data.change({ adminConfirm: event.target.value })}
                                />

                            </Grid>

                        ) : (

                            <Grid columns={2} mobileColumns={1} gap={4}>

                                <Field
                                    id="onboarding-email" label={t("email")} type="email" dir="ltr" autoComplete="email"
                                    value={values.email} error={errors.email} disabled={data.pending}
                                    onChange={( event ) => data.change({ email: event.target.value })}
                                />

                                <PasswordField
                                    id="onboarding-password" label={t("password")} autoComplete="new-password"
                                    value={values.password} error={errors.password} disabled={data.pending}
                                    onChange={( event ) => data.change({ password: event.target.value })}
                                />

                                <PasswordField
                                    id="onboarding-confirm" label={t("confirm")} autoComplete="new-password"
                                    value={values.confirm} error={errors.confirm} disabled={data.pending}
                                    onChange={( event ) => data.change({ confirm: event.target.value })}
                                />

                            </Grid>

                        )}

                        {!data.signed ? (

                            <Text size="small" tone="muted">

                                {t("haveAccount")} <Link href={data.loginHref} variant="text">{t("signIn")}</Link>

                            </Text>

                        ) : null}

                        <FormFeedback id="onboarding-failure" error={data.error} />

                        <Stack direction="row" justify="between" gap={3}>

                            <Button variant="ghost" disabled={data.pending} onClick={data.back}>

                                <Icon name="arrow-start" />{t("back")}

                            </Button>

                            <Button type="submit" size="large" pending={data.pending}>

                                {t(summary?.free ? "create" : "continue")}<Icon name="arrow-end" />

                            </Button>

                        </Stack>

                    </Form>

                ) : data.step === "payment" ? (

                    <Stack gap={6}>

                        <Stack gap={1}>

                            <Heading level={2} size="title">{t("paymentTitle")}</Heading>

                            <Text size="small" tone="muted">{t("paymentBody")}</Text>

                        </Stack>

                        {data.gatewaysLoading ? <SectionSkeleton /> : (

                            <PaymentChoices
                                id="onboarding-currency"
                                value={data.method}
                                options={data.options}
                                currency={data.currency}
                                currencies={data.currencies}
                                disabled={data.pending}
                                onChange={data.setMethod}
                                onCurrency={data.setCurrency}
                            />

                        )}

                        <FormFeedback id="onboarding-pay-failure" error={data.error} />

                        <Stack direction="row" justify="between" gap={3}>

                            <Button variant="ghost" disabled={data.pending} onClick={data.back}>

                                <Icon name="arrow-start" />{t("back")}

                            </Button>

                            <Button size="large" pending={data.pending} disabled={!data.method} onClick={() => { void data.submit(); }}>

                                <Icon name="lock" />{t("payAndCreate")}

                            </Button>

                        </Stack>

                    </Stack>

                ) : data.challenge ? (

                    <Stack gap={5}>

                        <Stack gap={1}>

                            <Heading level={2} size="title">{t("verifyTitle")}</Heading>

                            <Text size="small" tone="muted">{t("verifyBody")}</Text>

                        </Stack>

                        <OnboardingVerify challenge={data.challenge.value} onVerified={() => data.verified(data.challenge?.next ?? null)} />

                    </Stack>

                ) : null}

            </Surface>

        </TaskLayout>

    );

}
