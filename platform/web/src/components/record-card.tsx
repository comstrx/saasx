import Amount from "@/elements/amount";
import Check from "@/elements/check";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Media from "@/elements/media";
import Menu from "@/elements/menu";
import Record from "@/elements/record";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Text from "@/elements/text";
import Icon, { type IconName } from "@/icons/icon";
import type { Money } from "@/lib/std/format";

type MenuItem = { key: string; label: string; icon: IconName; danger?: boolean; onSelect: () => void };
type Props = {
    name: string; href: string; reference: string; image?: string | null;
    status: { label: string; tone: "neutral" | "positive" | "attention" | "negative" };
    description?: string; detail?: string;
    total?: { amount: Money; label: string; currencyLabel: string };
    action: string;
    select?: { id: string; label: string; checked: boolean; onChange: ( value: boolean ) => void } | null;
    menu?: { label: string; items: readonly MenuItem[] } | null;
};

export default function RecordCard ({ name, href, reference, image, status, description, detail, total, action, select, menu }: Props) {

    return (

        <Record
            media={image ? <Media src={image} alt="" ratio="square" /> : undefined}
            details={(

                <Stack gap={1}>

                    {total ? <Text size="small" tone="muted">{total.label}</Text> : null}
                    {total ? <Amount {...total.amount} currencyLabel={total.currencyLabel} size="title" /> : null}
                    {detail ? <Text size="small" tone="muted">{detail}</Text> : null}

                </Stack>

            )}
            action={<Link href={href} variant="outlined">{action}<Icon name="arrow-end" size="sm" /></Link>}
        >

            <Stack direction="row" gap={2} align="center" justify="between" wrap>

                <Stack direction="row" gap={2} align="center">

                    {select ? (

                        <Check
                            id={select.id} label={select.label} labelVisible={false} checked={select.checked} onChange={select.onChange}
                        />

                    ) : null}

                    <Text size="small" tone="muted" numeric dir="auto">{reference}</Text>

                </Stack>

                <Stack direction="row" gap={1} align="center">

                    <Status tone={status.tone}>{status.label}</Status>

                    {menu ? (

                        <Menu
                            label={menu.label} look="ghost" align="end" trigger={<Icon name="dots" />}
                            sections={[{
                                key: "record",
                                items: menu.items.map(( item ) => ({
                                    key: item.key, label: item.label, icon: <Icon name={item.icon} />, onSelect: item.onSelect,
                                    ...(item.danger ? { tone: "danger" as const } : {}),
                                })),
                            }]}
                        />

                    ) : null}

                </Stack>

            </Stack>

            <Heading level={2} size="title"><Link href={href} variant="heading" dir="auto">{name}</Link></Heading>
            {description ? <Text size="small" tone="muted">{description}</Text> : null}

        </Record>

    );

}
