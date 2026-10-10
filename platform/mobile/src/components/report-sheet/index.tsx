import { useEffect, useState } from "react";
import { Choice } from "@/components/choice";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Divider } from "@/elements/divider";
import { Fullscreen } from "@/elements/fullscreen";
import { Appear } from "@/elements/motion";
import { Text } from "@/elements/text";
import { Textarea } from "@/elements/textarea";

export type ReportReason = {
    key: string;
    label: string;
    open?: boolean | undefined;
};

type ReportSheetProps = {
    open: boolean;
    title: string;
    body: string;
    action: string;
    reasons: readonly ReportReason[];
    noteHint: string;
    busy?: boolean | undefined;
    onSubmit: ( reason: string, note: string ) => void;
    onClose: () => void;
};

const noteLimit = 500;

export function ReportSheet ({ open, title, body, action, reasons, noteHint, busy = false, onSubmit, onClose }: ReportSheetProps) {

    const [ reason, setReason ] = useState("");
    const [ note, setNote ] = useState("");
    const worded = reasons.find(( entry ) => entry.key === reason )?.open ?? false;
    const said = note.trim();

    useEffect(() => {

        if ( open ) return;

        setReason("");
        setNote("");

    }, [ open ]);

    return (
        <Fullscreen
            open={open}
            title={title}
            onClose={onClose}
            footer={<Button label={action} loading={busy} disabled={!reason || ( worded && !said )} onPress={() => onSubmit(reason, worded ? said : "") } />}
        >
            <Box gap="5">
                <Text rank="body" ink="soft">{body}</Text>

                <Box>
                    {reasons.map(( entry, index ) => (
                        <Box key={entry.key}>
                            {index > 0 ? <Divider /> : null}

                            <Choice
                                kind="radio"
                                trail
                                label={entry.label}
                                selected={reason === entry.key}
                                onPress={() => setReason(entry.key) }
                            />
                        </Box>
                    ))}
                </Box>

                {worded ? (
                    <Appear from="below">
                        <Textarea value={note} onChangeText={setNote} placeholder={noteHint} rows={4} limit={noteLimit} maxLength={noteLimit} autoFocus />
                    </Appear>
                ) : null}
            </Box>
        </Fullscreen>
    );

}
