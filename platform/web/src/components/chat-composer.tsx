"use client";

import Button from "@/elements/button";
import FileButton from "@/elements/file-button";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Tag from "@/elements/tag";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import Icon from "@/icons/icon";
import FormFeedback from "./form-feedback";

type Props = {
    draft: string; files: readonly File[]; sending: boolean; error: string | null; replying: { author: string; text: string } | null;
    labels: {
        message: string; send: string; attach: string; cancelReply: string; replyingTo: ( author: string ) => string;
        removeFile: ( name: string ) => string;
    };
    onDraft: ( value: string ) => void; onSend: () => void; onFiles: ( files: File[] ) => void; onRemoveFile: ( index: number ) => void;
    onCancelReply: () => void;
};

export default function ChatComposer ( props: Props ) {

    const { labels } = props;

    return (

        <Form pending={props.sending} noValidate onSubmit={( event ) => { event.preventDefault(); props.onSend(); }}>

            {props.replying ? (

                <Surface tone="track" border={false} elevation="none" padding={3} radius="md">

                    <Stack direction="row" align="center" justify="between" gap={3}>

                        <Stack gap={0}>

                            <Text size="label" weight="semibold">{labels.replyingTo(props.replying.author)}</Text>

                            <Text size="small" tone="muted" truncate dir="auto">{props.replying.text}</Text>

                        </Stack>

                        <Button
                            variant="ghost" size="small" rounded="full" icon aria-label={labels.cancelReply} onClick={props.onCancelReply}
                        >

                            <Icon name="x" />

                        </Button>

                    </Stack>

                </Surface>

            ) : null}

            {props.files.length ? (

                <Stack direction="row" gap={2} wrap>

                    {props.files.map(( file, index ) => (

                        <Tag
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            icon={<Icon name="paperclip" size="sm" />}
                            removeLabel={labels.removeFile(file.name)}
                            onRemove={() => props.onRemoveFile(index)}
                        >

                            {file.name}

                        </Tag>

                    ))}

                </Stack>

            ) : null}

            <Stack direction="row" align="end" gap={2}>

                <FileButton id="chat-files" label={labels.attach} multiple disabled={props.sending} onFiles={props.onFiles}>

                    <Icon name="paperclip" />

                </FileButton>

                <Stack grow>

                    <Textarea
                        id="chat-draft" label={labels.message} labelHidden rows={2} maxLength={5000} dir="auto" value={props.draft}
                        placeholder={labels.message} disabled={props.sending} onChange={( event ) => props.onDraft(event.target.value)}
                    />

                </Stack>

                <Button
                    type="submit" rounded="full" icon aria-label={labels.send} pending={props.sending}
                    disabled={!props.draft.trim() && !props.files.length}
                >

                    <Icon name="send" />

                </Button>

            </Stack>

            <FormFeedback id="chat-draft-failure" error={props.error} />

        </Form>

    );

}
