"use client";

import Art from "@/elements/art";
import Button from "@/elements/button";
import Counter from "@/elements/counter";
import Heading from "@/elements/heading";
import InboxRow from "@/elements/inbox-row";
import Link from "@/elements/link";
import Popover from "@/elements/popover";
import Segmented from "@/elements/segmented";
import Spinner from "@/elements/spinner";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useNotificationBell } from "@/hooks/use-notification-bell";
import type { NotificationLinks } from "@/hooks/use-notifications";
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    href: string;
    links: NotificationLinks;
    labels: {
        open: string; title: string; readAll: string; all: string; unread: string; viewAll: string; empty: string; emptyBody: string;
        failed: string; retry: string; loading: string; untitled: string; filter: string;
    };
};

export default function NotificationBell ({ href, links, labels }: Props) {

    const bell = useNotificationBell(links, { untitled: labels.untitled, failed: labels.failed });

    return (

        <Popover
            label={bell.unread ? `${labels.open} (${bell.unread})` : labels.open}
            title={labels.title}
            look="pebble"
            width="inbox"
            padding="none"
            open={bell.open}
            onOpenChange={bell.change}
            trigger={<><Icon name="bell" weight={bell.open ? "fill" : "regular"} /><Counter value={bell.unread} placement="floating" /></>}
        >

            <Stack gap={0}>

                <Stack direction="row" align="center" justify="between" gap={3} inset="large">

                    <Stack direction="row" align="center" gap={2}>

                        <Heading level={2} size="title">{labels.title}</Heading>

                        <Counter value={bell.unread} tone="ember" />

                    </Stack>

                    {bell.unread ? (

                        <Button variant="ghost" size="small" pending={bell.marking} onClick={() => { void bell.markAll(); }}>

                            <Icon name="check-circle" />{labels.readAll}

                        </Button>

                    ) : null}

                </Stack>

                <Stack inset="none" gap={0} width="full">

                    <Stack direction="row" inset="small" gap={0}>

                        <Segmented
                            label={labels.filter}
                            value={bell.unreadOnly ? "unread" : "all"}
                            options={[{ value: "all", label: labels.all }, { value: "unread", label: labels.unread }]}
                            onValueChange={( value ) => bell.setUnreadOnly(value === "unread")}
                        />

                    </Stack>

                    {bell.loading ? (

                        <Stack align="center" justify="center" inset="large"><Spinner size="large" label={labels.loading} /></Stack>

                    ) : bell.failed ? (

                        <Stack align="center" gap={3} inset="large">

                            <Text size="small" tone="muted" align="center">{labels.failed}</Text>

                            <Button variant="outlined" size="small" onClick={bell.reload}><Icon name="refresh" />{labels.retry}</Button>

                        </Stack>

                    ) : bell.items.length ? (

                        <Stack as="ul" gap={1} inset="small">

                            {bell.items.map(( item ) => (

                                <InboxRow
                                    key={item.id}
                                    title={item.title}
                                    body={item.body}
                                    time={item.when}
                                    unread={!item.read}
                                    icon={isIconName(item.icon) ? <Icon name={item.icon} /> : <Icon name="bell" />}
                                    href={item.href}
                                    onOpen={() => { void bell.visit(item.id, null, item.read); }}
                                />

                            ))}

                        </Stack>

                    ) : (

                        <Stack align="center" gap={3} inset="large">

                            <Art src="/assets/images/brand/bell.webp" size="small" />

                            <Stack gap={1} align="center">

                                <Text size="value" weight="semibold" align="center">{labels.empty}</Text>

                                <Text size="small" tone="muted" align="center" measure="narrow">{labels.emptyBody}</Text>

                            </Stack>

                        </Stack>

                    )}

                </Stack>

                <Stack direction="row" justify="center" inset="medium" divided>

                    <Link href={href} variant="text" onClick={() => bell.change(false)}>{labels.viewAll}</Link>

                </Stack>

            </Stack>

        </Popover>

    );

}
