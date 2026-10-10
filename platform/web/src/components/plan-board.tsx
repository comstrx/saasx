"use client";

import Amount from "@/elements/amount";
import Badge from "@/elements/badge";
import Divider from "@/elements/divider";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Segmented from "@/elements/segmented";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Tier from "@/elements/tier";
import { usePlanBoard } from "@/hooks/use-plan-board";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import type { Money } from "@/lib/std/format";
import StateNotice from "./state-notice";

type Duration = "monthly" | "yearly" | "lifetime";
type Quote = { now: Money | null; was: Money | null; amount: number } | null;
type Plan = {
    id: number; name: string; description: string | null; features: readonly string[]; free: boolean; featured: boolean;
    badge: "recommended" | "popular" | "premium" | null; prices: Record<Duration, Quote>; links: Record<Duration, string | null>;
};
type Props = { items: readonly Plan[]; durations: readonly Duration[]; initial: Duration; saving: number; art: string };

export default function PlanBoard ({ items, durations, initial, saving, art }: Props) {

    const t = useTranslations("plans");
    const board = usePlanBoard(initial, durations);

    if ( !items.length ) return <StateNotice art={art} title={t("emptyTitle")} description={t("emptyBody")} />;

    return (

        <Stack gap={12}>

            <Stack align="center" gap={3}>

                <Segmented
                    label={t("billing")}
                    value={board.duration}
                    width="auto"
                    options={durations.map(( duration ) => ({ value: duration, label: t(`durations.${duration}`) }))}
                    onValueChange={board.pick}
                />

                {saving > 0 ? (

                    <Text size="small" weight="medium" tone="accent" align="center">{t("saveYearly", { percent: saving })}</Text>

                ) : null}

            </Stack>

            <Grid as="ul" columns={items.length > 2 ? 3 : 2} mobileColumns={1} gap={6} label={t("title")}>

                {items.map(( plan ) => {

                    const price = plan.prices[board.duration];
                    const href = plan.links[board.duration];

                    return (

                        <Tier
                            key={plan.id}
                            featured={plan.featured}
                            badge={plan.badge ? (

                                <Badge tone={plan.featured ? "teal" : plan.badge === "premium" ? "ivory" : "neutral"} size="large">

                                    {t(`badges.${plan.badge}`)}

                                </Badge>

                            ) : null}
                        >

                            <Stack gap={2}>

                                <Heading level={2} size="h3">{plan.name}</Heading>

                                {plan.description ? <Text size="small" tone="muted" wrap="pretty">{plan.description}</Text> : null}

                            </Stack>

                            <Stack gap={1}>

                                {!price ? <Text tone="muted">{t("unavailable")}</Text> : plan.free || !price.now || price.amount === 0 ? (

                                    <Heading level={3} size="display">{t("free")}</Heading>

                                ) : (

                                    <Stack direction="row" align="baseline" gap={2} wrap>

                                        <Amount {...price.now} currencyLabel={price.now.currency} size="display" />

                                        <Text size="small" tone="muted">{t(`per.${board.duration}`)}</Text>

                                    </Stack>

                                )}

                                {price?.was ? (

                                    <Stack direction="row" align="center" gap={2}>

                                        <Amount {...price.was} currencyLabel={price.was.currency} size="small" strike />

                                        <Badge tone="ember" look="flat">{t("deal")}</Badge>

                                    </Stack>

                                ) : null}

                            </Stack>

                            {href && price ? (

                                <Link
                                    href={href}
                                    variant={plan.featured ? "filled" : "outlined"}
                                    size="large"
                                    shape="pill"
                                    width="full"
                                    onClick={() => board.choose(plan.id)}
                                >

                                    {t(plan.free ? "startFree" : "choose", { plan: plan.name })}

                                </Link>

                            ) : null}

                            {plan.features.length ? (

                                <>

                                    <Divider />

                                    <Stack as="ul" gap={3} aria-label={t("includes", { plan: plan.name })}>

                                        {plan.features.map(( feature ) => (

                                            <Stack as="li" key={feature} direction="row" align="start" gap={3}>

                                                <Icon name="check-circle" size="md" weight="fill" tone={board.mark(plan.featured)} />

                                                <Text size="small" wrap="pretty">{feature}</Text>

                                            </Stack>

                                        ))}

                                    </Stack>

                                </>

                            ) : null}

                        </Tier>

                    );

                })}

            </Grid>

        </Stack>

    );

}
