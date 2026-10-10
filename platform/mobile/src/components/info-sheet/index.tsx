import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Divider } from "@/elements/divider";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";

export type InfoRow = {
    key: string;
    label: string;
    value: string;
};

type InfoSheetProps = {
    open: boolean;
    title: string;
    body: string;
    action: string;
    rows?: readonly InfoRow[] | undefined;
    note?: string | undefined;
    onClose: () => void;
};

export function InfoSheet ({ open, title, body, action, rows = [], note, onClose }: InfoSheetProps) {

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={title}
            footer={<Button label={action} onPress={onClose} />}
        >
            <Box gap="4">
                <Text rank="body" ink="soft">{body}</Text>

                {rows.length > 0 ? (
                    <>
                        <Divider />

                        <Box gap="3">
                            {rows.map(( row ) => (
                                <Box key={row.key} row align="start" justify="between" gap="4">
                                    <Text rank="body" ink="soft">{row.label}</Text>
                                    <Text rank="action">{row.value}</Text>
                                </Box>
                            ))}
                        </Box>
                    </>
                ) : null}

                {note ? <Text rank="caption" ink="faint">{note}</Text> : null}
            </Box>
        </Sheet>
    );

}
