import type { ReactNode } from "react";
import Button from "@/elements/button";
import Card from "@/elements/card";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons";

export type Note = { text: string; tone: "muted" | "success" | "danger" };
type Props = {
    icon: string;
    title: string;
    detail?: string | undefined;
    action?: { label: string; busy: boolean; disabled?: boolean | undefined; onPress: () => void } | undefined;
    note?: Note | undefined;
    children?: ReactNode | undefined;
};

export default function ActionCard ({ icon, title, detail, action, note, children }: Props) {

    return (

        <Card>

            <Stack direction="row" gap={2}>

                <Icon name={icon} />

                <Text text={title} size="lg" />

            </Stack>

            {detail ? <Text text={detail} tone="muted" size="sm" /> : null}

            {children}

            {note ? <Text text={note.text} tone={note.tone} size="sm" /> : null}

            {action ? <Button label={action.label} busy={action.busy} disabled={action.disabled} onPress={action.onPress} /> : null}

        </Card>

    );

}
