import { useState } from "react";
import { StyleSheet } from "react-native-unistyles";
import { type ReportReason, ReportSheet } from "@/components/report-sheet";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";

type ReportLinkProps = {
    label: string;
    title: string;
    body: string;
    action: string;
    reasons: readonly ReportReason[];
    noteHint: string;
    busy?: boolean | undefined;
    onSubmit: ( reason: string, note: string ) => void;
};

export function ReportLink ({ label, title, body, action, reasons, noteHint, busy = false, onSubmit }: ReportLinkProps) {

    const [ open, setOpen ] = useState(false);

    return (
        <>
            <Box style={styles.wide}>
                <Button label={label} icon="alert" kind="outline" tint="danger" onPress={() => setOpen(true) } />
            </Box>

            <ReportSheet
                open={open}
                title={title}
                body={body}
                action={action}
                reasons={reasons}
                noteHint={noteHint}
                busy={busy}
                onSubmit={( reason, note ) => { setOpen(false); onSubmit(reason, note); }}
                onClose={() => setOpen(false) }
            />
        </>
    );

}

const styles = StyleSheet.create({

    wide: {
        width: "80%",
        alignSelf: "center",
    },

});
