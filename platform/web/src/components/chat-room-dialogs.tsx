"use client";

import FormFeedback from "@/components/form-feedback";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Field from "@/elements/field";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import Icon from "@/icons/icon";

type Props = {
    asked: "delete" | "report" | null; name: string; reason: string; content: string; reporting: boolean; erasing: boolean;
    error: string | null;
    labels: {
        close: string; reportTitle: string; reportBody: string; reason: string; details: string; send: string;
        deleteTitle: string; deleteBody: string; delete: string; destroy: string; destroyHint: string;
    };
    onClose: () => void; onReason: ( value: string ) => void; onContent: ( value: string ) => void; onSend: () => void;
    onErase: ( forever: boolean ) => void;
};

export default function ChatRoomDialogs ( props: Props ) {

    const { labels } = props;

    return (

        <>

            <Dialog
                open={props.asked === "report"}
                onOpenChange={( open ) => { if ( !open ) props.onClose(); }}
                title={labels.reportTitle}
                description={labels.reportBody}
                close={labels.close}
                dismissible={!props.reporting}
                footer={(

                    <>

                        <Button variant="ghost" disabled={props.reporting} onClick={props.onClose}>{labels.close}</Button>

                        <Button
                            pending={props.reporting} disabled={props.reason.trim().length < 2 || props.content.trim().length < 2}
                            onClick={props.onSend}
                        >

                            <Icon name="flag" />{labels.send}

                        </Button>

                    </>

                )}
            >

                <Stack gap={4}>

                    <Field
                        id="chat-report-reason" label={labels.reason} maxLength={200} dir="auto" value={props.reason}
                        disabled={props.reporting} onChange={( event ) => props.onReason(event.target.value)}
                    />

                    <Textarea
                        id="chat-report-details" label={labels.details} rows={4} maxLength={5000} dir="auto" value={props.content}
                        disabled={props.reporting} onChange={( event ) => props.onContent(event.target.value)}
                    />

                    <FormFeedback id="chat-report-failure" error={props.error} />

                </Stack>

            </Dialog>

            <Dialog
                open={props.asked === "delete"}
                onOpenChange={( open ) => { if ( !open ) props.onClose(); }}
                title={labels.deleteTitle}
                close={labels.close}
                dismissible={!props.erasing}
                footer={(

                    <>

                        <Button variant="ghost" disabled={props.erasing} onClick={props.onClose}>{labels.close}</Button>

                        <Stack direction="row" gap={2} wrap>

                            <Button variant="outlined" disabled={props.erasing} onClick={() => props.onErase(true)}>

                                {labels.destroy}

                            </Button>

                            <Button variant="danger" pending={props.erasing} onClick={() => props.onErase(false)}>

                                <Icon name="trash" />{labels.delete}

                            </Button>

                        </Stack>

                    </>

                )}
            >

                <Stack gap={3}>

                    <Text tone="muted" wrap="pretty">{labels.deleteBody}</Text>

                    <Text size="small" tone="muted" wrap="pretty">{labels.destroyHint}</Text>

                </Stack>

            </Dialog>

        </>

    );

}
