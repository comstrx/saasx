"use client";

import Amount from "@/elements/amount";
import Button from "@/elements/button";
import Divider from "@/elements/divider";
import Emblem from "@/elements/emblem";
import Facts from "@/elements/facts";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Surface from "@/elements/surface";
import Switch from "@/elements/switch";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import type { Money } from "@/lib/std/format";

type Item = {
    id: number; name: string; status: "active" | "unpaid" | "expired"; workspace: string | null; host: string | null;
    duration: string | null; price: Money | null; started: string | null; expires: string | null; autoRenew: boolean;
    renewable: boolean; payable: boolean; cancellable: boolean; reviewable: boolean;
};
type Props = {
    item: Item; toggling: boolean;
    onToggle: ( value: boolean ) => void; onPay: () => void; onReview: () => void; onCancel: () => void;
};

const tones = { active: "positive", unpaid: "attention", expired: "negative" } as const;

export default function SubscriptionCard ({ item, toggling, onToggle, onPay, onReview, onCancel }: Props) {

    const t = useTranslations("subscriptions");
    const facts = [
        ...(item.workspace ? [{ key: "workspace", term: t("workspace"), detail: item.workspace, icon: <Icon name="buildings" /> }] : []),
        ...(item.started ? [{ key: "started", term: t("started"), detail: item.started, icon: <Icon name="calendar-check" /> }] : []),
        ...(item.expires ? [{
            key: "expires", term: t(item.autoRenew && item.renewable ? "renews" : "expires"), detail: item.expires,
            icon: <Icon name="calendar" />,
        }] : []),
    ];

    return (

        <Surface as="li" padding={6} radius="xl">

            <Stack gap={5}>

                <Stack direction="responsive" justify="between" align="start" gap={4}>

                    <Stack direction="row" align="center" gap={4}>

                        <Emblem tone="teal" size="large"><Icon name="crown" /></Emblem>

                        <Stack gap={1}>

                            <Stack direction="row" align="center" gap={2} wrap>

                                <Heading level={2} size="title">{item.name}</Heading>

                                <Status tone={tones[item.status]}>{t(`status.${item.status}`)}</Status>

                            </Stack>

                            {item.host ? (

                                <Text size="small" tone="muted">

                                    <Text as="span" size="small" tone="muted" dir="ltr">{item.host}</Text>

                                </Text>

                            ) : null}

                        </Stack>

                    </Stack>

                    {item.price ? (

                        <Stack gap={0} align="end">

                            <Amount {...item.price} currencyLabel={item.price.currency} size="large" />

                            {item.duration ? <Text size="small" tone="muted">{item.duration}</Text> : null}

                        </Stack>

                    ) : null}

                </Stack>

                {facts.length ? <Facts columns={3} compact items={facts} /> : null}

                <Divider />

                <Stack direction="responsive" justify="between" align="center" gap={4}>

                    {item.renewable ? (

                        <Switch
                            id={`renew-${item.id}`}
                            label={t("autoRenew")}
                            detail={t("autoRenewHint")}
                            checked={item.autoRenew}
                            disabled={toggling}
                            onChange={onToggle}
                        />

                    ) : <Text size="small" tone="muted">{t(`note.${item.status}`)}</Text>}

                    <Stack direction="row" gap={2} wrap>

                        {item.payable ? <Button size="small" onClick={onPay}><Icon name="card" />{t("pay")}</Button> : null}

                        {item.reviewable ? (

                            <Button variant="outlined" size="small" onClick={onReview}><Icon name="star" />{t("review")}</Button>

                        ) : null}

                        {item.cancellable ? <Button variant="ghost" size="small" onClick={onCancel}>{t("cancel")}</Button> : null}

                    </Stack>

                </Stack>

            </Stack>

        </Surface>

    );

}
