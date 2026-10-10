"use client";

import FormFeedback from "@/components/form-feedback";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import InboxRow from "@/elements/inbox-row";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import Icon from "@/icons/icon";

type Target = { id: number; title: string; image: string | null; initials: string };
type Props = {
    editing: { id: number; content: string } | null; editPending: boolean; editError: string | null;
    forwarding: boolean; forwardPending: boolean; targets: readonly Target[];
    labels: {
        close: string; editTitle: string; message: string; save: string; forwardTitle: string; forwardBody: string; noTargets: string;
    };
    onEditChange: ( content: string ) => void; onEditClose: () => void; onSave: () => void;
    onForwardClose: () => void; onForward: ( roomId: number ) => void;
};

export default function ChatMessageDialogs ( props: Props ) {

    const { labels } = props;

    return (

        <>

            <Dialog
                open={props.editing != null}
                onOpenChange={( open ) => { if ( !open ) props.onEditClose(); }}
                title={labels.editTitle}
                close={labels.close}
                dismissible={!props.editPending}
                footer={(

                    <>

                        <Button variant="ghost" disabled={props.editPending} onClick={props.onEditClose}>{labels.close}</Button>

                        <Button pending={props.editPending} disabled={!props.editing?.content.trim()} onClick={props.onSave}>

                            <Icon name="check" />{labels.save}

                        </Button>

                    </>

                )}
            >

                <Stack gap={4}>

                    <Textarea
                        id="chat-edit" label={labels.message} labelHidden rows={4} maxLength={5000} dir="auto"
                        value={props.editing?.content ?? ""} disabled={props.editPending}
                        onChange={( event ) => props.onEditChange(event.target.value)}
                    />

                    <FormFeedback id="chat-edit-failure" error={props.editError} />

                </Stack>

            </Dialog>

            <Dialog
                open={props.forwarding}
                onOpenChange={( open ) => { if ( !open ) props.onForwardClose(); }}
                title={labels.forwardTitle}
                description={labels.forwardBody}
                close={labels.close}
                dismissible={!props.forwardPending}
            >

                {props.targets.length ? (

                    <Stack as="ul" gap={1}>

                        {props.targets.map(( target ) => (

                            <InboxRow
                                key={target.id}
                                title={target.title}
                                framed={false}
                                busy={props.forwardPending ? labels.forwardTitle : null}
                                icon={<Portrait size="small" src={target.image} alt="" initials={target.initials} />}
                                onOpen={() => props.onForward(target.id)}
                            />

                        ))}

                    </Stack>

                ) : <Text size="small" tone="muted">{labels.noTargets}</Text>}

            </Dialog>

        </>

    );

}
