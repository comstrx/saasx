"use client";

import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import Dialog from "@/elements/dialog";
import Field from "@/elements/field";
import InboxRow from "@/elements/inbox-row";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Contact = { id: number; name: string; image: string | null; initials: string; role: string | null };
type Props = {
    open: boolean; query: string; loading: boolean; failed: boolean; selected: number | null; items: readonly Contact[];
    labels: {
        title: string; body: string; close: string; search: string; empty: string; retry: string; unavailable: string; opening: string;
    };
    onOpenChange: ( open: boolean ) => void; onQuery: ( value: string ) => void; onChoose: ( id: number ) => void; onReload: () => void;
};

export default function ChatContacts ( props: Props ) {

    const { labels } = props;

    return (

        <Dialog open={props.open} onOpenChange={props.onOpenChange} title={labels.title} description={labels.body} close={labels.close}>

            <Stack gap={4}>

                <Field
                    id="chat-contacts-search" label={labels.search} labelHidden type="search" value={props.query}
                    placeholder={labels.search}
                    start={<Icon name="search" tone="muted" />} onChange={( event ) => props.onQuery(event.target.value)}
                />

                {props.failed ? (

                    <FormRetry id="chat-contacts-failure" message={labels.unavailable} label={labels.retry} onRetry={props.onReload} />

                )
                    : props.loading ? <SectionSkeleton />
                    : props.items.length ? (

                        <Stack as="ul" gap={1}>

                            {props.items.map(( contact ) => (

                                <InboxRow
                                    key={contact.id} title={contact.name} body={contact.role} framed={false}
                                    busy={props.selected === contact.id ? labels.opening : null}
                                    icon={<Portrait size="small" src={contact.image} alt="" initials={contact.initials} />}
                                    onOpen={() => props.onChoose(contact.id)}
                                />

                            ))}

                        </Stack>

                    ) : <Text size="small" tone="muted">{labels.empty}</Text>}

            </Stack>

        </Dialog>

    );

}
