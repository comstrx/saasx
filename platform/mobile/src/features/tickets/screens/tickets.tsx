import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ComposeSheet } from "@/components/compose-sheet";
import { Loading } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import { Empty } from "@/elements/empty";
import type { IconName } from "@/elements/icon";
import { Round } from "@/elements/round";
import { Screen } from "@/elements/screen";
import { Tabs } from "@/elements/tabs";
import { Feed, Filtered, Guest } from "@/features/shell";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { TicketCard } from "@/features/tickets/components/ticket-card";
import { failureShape } from "@/model/failure";
import { type TicketStatus, ticketStatuses } from "@/model/ticket";
import { itemsOf } from "@/query/shelf";
import { useOpenTicket, useTickets } from "@/query/tickets";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";

type Bucket = TicketStatus | "all";

const buckets: readonly Bucket[] = [ "all", ...ticketStatuses ];

const bucketGlyphs: Readonly<Record<Bucket, IconName>> = {
    all: "support",
    pending: "clock",
    resolved: "checkCircle",
    closed: "archive",
};

export function TicketsScreen () {

    const { t } = useTranslation();
    const when = useWhen();
    const token = useSession(( state ) => state.token );

    const [ bucket, setBucket ] = useState<Bucket>("all");
    const [ composing, setComposing ] = useState(false);
    const [ error, setError ] = useState("");

    const list = useTickets(bucket);
    const opening = useOpenTicket();

    const submit = async ( title: string, content: string ) => {

        setError("");

        try {

            const ticket = await opening.mutateAsync({ title, content });

            setComposing(false);
            notify(t("tickets.opened"), "success");
            router.push(`/ticket/${ ticket.id }`);

        }
        catch ( failure ) {

            const shape = failureShape(failure, [ "title", "content" ]);
            const note = shape.fields.content ?? shape.fields.title;

            if ( note ) setError(note);
            else notify(shape.body);

        }

    };

    if ( !token ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar title={t("tickets.title")} onBack={() => retreat() } />

                <Guest note={t("tickets.guestBody")} onLogin={() => router.push("/login")} />
            </Screen>
        );

    }

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("tickets.title")} onBack={() => retreat() } actions={<Round icon="plus" label={t("tickets.new")} onPress={() => setComposing(true) } />}>
                <Tabs
                    active={bucket}
                    onPick={setBucket}
                    options={buckets.map(( entry ) => ({ key: entry, label: t(`tickets.bucket.${ entry }`), icon: bucketGlyphs[entry] }) )}
                />
            </AppBar>

            <Feed
                key={bucket}
                list={list}
                items={itemsOf(list.data)}
                keyOf={( ticket ) => String(ticket.id) }
                render={( ticket ) => (
                    <TicketCard
                        ticket={ticket}
                        at={when.stamp(ticket.updatedAt ?? ticket.createdAt)}
                        onPress={() => router.push(`/ticket/${ ticket.id }`) }
                    />
                )}
                loading={<Loading shape="card" rows={3} />}
                empty={bucket === "all" ? (
                    <Empty
                        emblem="support"
                        title={t("tickets.emptyTitle")}
                        note={t("tickets.emptyBody")}
                        action={t("tickets.new")}
                        onAction={() => setComposing(true) }
                    />
                ) : <Filtered emblem="support" filter={t(`tickets.bucket.${ bucket }`)} all={t("tickets.bucket.all")} />}
            />

            <ComposeSheet
                open={composing}
                title={t("tickets.new")}
                body={t("tickets.newBody")}
                subjectHint={t("tickets.subjectHint")}
                contentHint={t("tickets.contentHint")}
                action={t("tickets.send")}
                busy={opening.isPending}
                error={error}
                onSubmit={( composed ) => { void submit(composed.title, composed.content); }}
                onClose={() => { setComposing(false); setError(""); }}
            />
        </Screen>
    );

}
