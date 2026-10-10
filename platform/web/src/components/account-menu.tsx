"use client";

import Button from "@/elements/button";
import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Navigation from "@/elements/navigation";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Tile from "@/elements/tile";
import { useAccountMenu } from "@/hooks/use-account-menu";
import Icon, { isIconName } from "@/icons/icon";
import ScrollRow from "./scroll-row";

type Item = { href: string; label: string; icon: string; current: boolean };
type Props = {
    label: string; labels: { verified: string; signOut: string };
    groups: readonly { key: string; title: string; items: readonly Item[] }[];
};

function glyph ( item: Item ) {

    return isIconName(item.icon) ? (

        <Icon name={item.icon} size="md" weight={item.current ? "fill" : "regular"} tone={item.current ? "accent" : "muted"} />

    ) : null;

}
export default function AccountMenu ({ label, labels, groups }: Props) {

    const { ready, user, leaving, leave } = useAccountMenu();

    if ( !ready || !user ) return null;

    return (

        <Navigation label={label}>

            <Stack visibility="mobile">

                <ScrollRow label={label} gap={2}>

                    {groups.flatMap(( group ) => group.items).map(( item ) => (

                        <Tile
                            key={item.href} href={item.href} title={item.label} active={item.current}
                            look="panel" size="small" icon={glyph(item)}
                        />

                    ))}

                </ScrollRow>

            </Stack>

            <Stack visibility="desktop" gap={4}>

                <Surface padding={5} radius="xl">

                    <Stack gap={3} align="center">

                        <Portrait size="large" src={user.image} alt={user.name} initials={user.initials} />

                        <Stack gap={0} align="center">

                            <Text size="title" weight="semibold" align="center" truncate dir="auto">{user.name}</Text>

                            {user.contact ? <Text size="small" tone="muted" truncate dir="ltr">{user.contact}</Text> : null}

                        </Stack>

                        {user.verified ? (

                            <Status tone="positive" icon={<Icon name="seal" size="sm" weight="fill" />}>{labels.verified}</Status>

                        ) : null}

                    </Stack>

                </Surface>

                <Surface padding={2} radius="xl">

                    <Stack gap={1}>

                        {groups.map(( group, index ) => (

                            <Stack key={group.key} gap={1}>

                                {index > 0 ? <Divider /> : null}

                                <Stack inset="small"><Heading level={2} size="label" tone="muted">{group.title}</Heading></Stack>

                                <Stack as="ul" gap={0}>

                                    {group.items.map(( item ) => (

                                        <Tile
                                            key={item.href} href={item.href} title={item.label} active={item.current} icon={glyph(item)}
                                        />

                                    ))}

                                </Stack>

                            </Stack>

                        ))}

                        <Divider />

                        <Button variant="ghost" align="start" width="full" pending={leaving} onClick={() => { void leave(); }}>

                            <Icon name="sign-out" />

                            {labels.signOut}

                        </Button>

                    </Stack>

                </Surface>

            </Stack>

        </Navigation>

    );

}
