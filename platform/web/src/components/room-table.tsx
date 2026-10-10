import Amount from "@/elements/amount";
import Badge from "@/elements/badge";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Table from "@/elements/table";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";
import type { Money } from "@/lib/std/format";

type Room = {
    id: number;
    name: string;
    href?: string | null;
    features: readonly { key: string; icon: string; text: string }[];
    sleeps: { adults: number; children: number; label: string };
    price: Money | null;
    currencyLabel: string;
    status: string | null;
    select: string | null;
    current: boolean;
};
type Props = {
    rooms: readonly Room[];
    labels: {
        from: string; unit: string; choose: string; selected: string; perks: readonly string[]; caption: string; taxes: string;
        columns: { room: string; sleeps: string; price: string; choices: string; select: string };
    };
};

function Sleeps ({ adults, children, label }: Room["sleeps"]) {

    if ( !adults && !children ) return <Text as="span" size="small" tone="muted">—</Text>;

    return (

        <Stack direction="row" align="center" gap={1} wrap aria-label={label} role="img">

            {Array.from({ length: Math.min(adults, 6) }, ( _, index ) => `adult-${index}`).map(( key ) => (

                <Icon key={key} name="user" size="md" weight="fill" />

            ))}

            {Array.from({ length: Math.min(children, 4) }, ( _, index ) => `child-${index}`).map(( key ) => (

                <Icon key={key} name="user" size="sm" tone="muted" />

            ))}

        </Stack>

    );

}
export default function RoomTable ({ rooms, labels }: Props) {

    const columns = [
        { key: "room", label: labels.columns.room, width: "34%" },
        { key: "sleeps", label: labels.columns.sleeps, width: "12%" },
        { key: "price", label: labels.columns.price, width: "18%" },
        { key: "choices", label: labels.columns.choices, width: "20%" },
        { key: "select", label: labels.columns.select, width: "16%", action: true },
    ];

    return (

        <Table
            caption={labels.caption}
            columns={columns}
            stack
            align="top"
            rows={rooms.map(( room ) => ({
                key: String(room.id),
                current: room.current,
                muted: Boolean(room.status),
                cells: {
                    room: (

                        <Stack gap={2}>

                            <Heading level={3} size="title">

                                {room.href ? <Link href={room.href} variant="text" dir="auto">{room.name}</Link> : room.name}

                            </Heading>

                            {room.features.length ? (

                                <Stack direction="row" gap={3} wrap>

                                    {room.features.map(( feature ) => (

                                        <Stack key={feature.key} direction="row" align="center" gap={1}>

                                            {isIconName(feature.icon) ? <Icon name={feature.icon} size="sm" tone="muted" /> : null}

                                            <Text as="span" size="label" tone="muted">{feature.text}</Text>

                                        </Stack>

                                    ))}

                                </Stack>

                            ) : null}

                        </Stack>

                    ),
                    sleeps: <Sleeps {...room.sleeps} />,
                    price: room.price ? (

                        <Stack gap={0}>

                            <Text as="span" size="label" tone="muted">{labels.from}</Text>

                            <Amount {...room.price} currencyLabel={room.currencyLabel} size="large" />

                            {labels.unit ? <Text as="span" size="label" tone="muted">{labels.unit}</Text> : null}

                            <Text as="span" size="micro" tone="muted">{labels.taxes}</Text>

                        </Stack>

                    ) : <Text as="span" size="small" tone="muted">—</Text>,
                    choices: labels.perks.length ? (

                        <Stack as="ul" gap={1}>

                            {labels.perks.map(( perk ) => (

                                <Stack as="li" key={perk} direction="row" align="start" gap={2}>

                                    <Icon name="check" size="sm" weight="bold" tone="success" />

                                    <Text as="span" size="small" tone="success" weight="medium">{perk}</Text>

                                </Stack>

                            ))}

                        </Stack>

                    ) : <Text as="span" size="small" tone="muted">—</Text>,
                    select: room.status ? <Badge tone="danger" look="flat">{room.status}</Badge> : room.select ? (

                        <Link
                            href={room.select}
                            variant={room.current ? "filled" : "outlined"}
                            size="medium"
                            width="full"
                            scroll={false}
                        >

                            {room.current ? <Icon name="check" weight="bold" /> : null}

                            {room.current ? labels.selected : labels.choose}

                        </Link>

                    ) : null,
                },
            }))}
        />

    );

}
