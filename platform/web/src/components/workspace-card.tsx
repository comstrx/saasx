"use client";

import Button from "@/elements/button";
import Check from "@/elements/check";
import Emblem from "@/elements/emblem";
import Facts from "@/elements/facts";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Item = {
    id: number; name: string; host: string | null; href: string | null; plan: string | null;
    status: "active" | "unpaid" | "expired"; expires: string | null; email: string | null; phone: string | null;
};
type Props = {
    item: Item; selected: boolean; selectable: boolean;
    onSelect: ( value: boolean ) => void; onEdit: () => void; onRenew: () => void; onDelete: () => void;
};

const tones = { active: "positive", unpaid: "attention", expired: "negative" } as const;

export default function WorkspaceCard ({ item, selected, selectable, onSelect, onEdit, onRenew, onDelete }: Props) {

    const t = useTranslations("workspaces");
    const facts = [
        ...(item.plan ? [{ key: "plan", term: t("plan"), detail: item.plan, icon: <Icon name="crown" /> }] : []),
        ...(item.expires ? [{ key: "expires", term: t("expires"), detail: item.expires, icon: <Icon name="calendar" /> }] : []),
        ...(item.email ? [{ key: "email", term: t("email"), detail: item.email, icon: <Icon name="mail" /> }] : []),
    ];

    return (

        <Surface as="li" padding={6} radius="xl">

            <Stack gap={5}>

                <Stack direction="responsive" justify="between" align="start" gap={4}>

                    <Stack direction="row" align="center" gap={4}>

                        {selectable ? (

                            <Check
                                id={`workspace-${item.id}`} label={t("select", { name: item.name })} labelVisible={false} checked={selected}
                                onChange={onSelect}
                            />

                        ) : null}

                        <Emblem tone="blue" size="large"><Icon name="buildings" /></Emblem>

                        <Stack gap={1}>

                            <Stack direction="row" align="center" gap={2} wrap>

                                <Heading level={2} size="title">{item.name}</Heading>

                                <Status tone={tones[item.status]}>{t(`status.${item.status}`)}</Status>

                            </Stack>

                            {item.href && item.host ? (

                                <Link href={item.href} variant="quiet" target="_blank" rel="noopener noreferrer">

                                    <Text as="span" size="small" dir="ltr">{item.host}</Text><Icon name="external" size="sm" />

                                </Link>

                            ) : null}

                        </Stack>

                    </Stack>

                    <Stack direction="row" gap={2} wrap>

                        <Button variant="outlined" size="small" onClick={onEdit}><Icon name="edit" />{t("edit")}</Button>

                        <Button variant={item.status === "active" ? "ghost" : "filled"} size="small" onClick={onRenew}>

                            <Icon name="refresh" />{t(item.status === "active" ? "renewEarly" : "renew")}

                        </Button>

                        <Button
                            variant="ghost"
                            size="small"
                            icon
                            rounded="full"
                            aria-label={t("deleteNamed", { name: item.name })}
                            onClick={onDelete}
                        >

                            <Icon name="trash" />

                        </Button>

                    </Stack>

                </Stack>

                {facts.length ? <Facts columns={3} compact items={facts} /> : null}

            </Stack>

        </Surface>

    );

}
