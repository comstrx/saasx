"use client";

import FormFeedback from "@/components/form-feedback";
import MessageFields from "@/components/message-fields";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Form from "@/elements/form";
import { useTicketEditor } from "@/hooks/use-ticket-editor";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = { ticketId: number; initial: { title: string; content: string } | null; onClose: () => void; onDone: () => void };

export default function TicketEditor ({ ticketId, initial, onClose, onDone }: Props) {

    const t = useTranslations("support");
    const data = useTicketEditor(ticketId, initial, onDone);

    return (

        <Dialog
            open={initial != null}
            onOpenChange={( open ) => { if ( !open && !data.pending ) onClose(); }}
            title={t("editTitle")}
            close={t("close")}
            dismissible={!data.pending}
            footer={(

                <>

                    <Button variant="ghost" disabled={data.pending} onClick={onClose}>{t("close")}</Button>

                    <Button pending={data.pending} onClick={() => { void data.save(); }}><Icon name="check" />{t("saveChanges")}</Button>

                </>

            )}
        >

            <Form pending={data.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void data.save(); }}>

                <MessageFields
                    title={t("subject")} content={t("message")} values={data.values} errors={data.errors}
                    id={( key ) => `ticket-edit-${key}`} disabled={data.pending} onChange={data.change}
                />

                <FormFeedback id="ticket-edit-failure" error={data.error} />

            </Form>

        </Dialog>

    );

}
