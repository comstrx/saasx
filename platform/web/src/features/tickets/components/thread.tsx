"use client";

import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import TicketEditor from "@/components/ticket-editor";
import TicketThread from "@/components/ticket-thread";
import { useTranslations } from "@/lib/providers/intl";
import { useTicket } from "../hooks/use-ticket";

type Props = { id: string | undefined; title: string; links: { login: string; list: string; order: string; art: string } };

export default function Thread ({ id, title, links }: Props) {

    const state = useTicket(id, links);
    const { t, form } = state;
    const common = useTranslations("common");

    if ( !state.ready ) return <SectionSkeleton />;

    if ( !state.token ) return (

        <SignInPrompt
            level={1} title={title} description={t("signInBody")} href={state.login} label={t("signIn")} art={links.art}
        />

    );

    if ( state.missing ) return <StateNotice level={1} title={t("missingTitle")} description={t("missingBody")} />;
    if ( state.failed ) return <FormRetry id="ticket-failure" message={t("unavailable")} label={common("retry")} onRetry={state.reload} />;
    if ( state.loading || !state.ticket ) return <SectionSkeleton />;

    return (

        <>

            <TicketThread
                back={state.back} ticket={state.ticket} rows={state.rows} busy={state.busy}
                composer={{
                    value: form.values.content, error: form.errors.content, failure: state.error, pending: state.pending, id: form.id,
                    onChange: ( content ) => form.change({ content }), onSubmit: () => { void state.send(); },
                }}
                labels={{
                    reply: t("reply"), replyHint: t("replyHint"), send: t("send"), actions: t("actions"), resolve: t("resolve"),
                    close: t("closeRequest"), reopen: t("reopen"), delete: t("delete"),
                    closedTitle: t("closedTitle"), closedBody: t("closedBody"), edit: t("edit"),
                }}
                onChange={( action ) => { void state.change(action); }}
                onDelete={() => { void state.discard(); }}
                onEdit={state.edit}
            />

            <TicketEditor ticketId={state.ticketId} initial={state.editing} onClose={() => state.setEditing(null)} onDone={state.edited} />

        </>

    );

}
