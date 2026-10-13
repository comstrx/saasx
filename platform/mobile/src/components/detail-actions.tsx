import Button from "@/elements/button";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons";

export type DetailAction = { label: string; icon: string; tone?: "primary" | "ghost" | "danger" | undefined; onPress: () => void };
type Props = { edit?: { href: string; label: string } | undefined; actions: readonly DetailAction[]; busy: boolean; note?: { text: string; tone: "muted" | "success" | "danger" } | undefined };

export default function DetailActions ({ edit, actions, busy, note }: Props) {

    return (

        <Stack gap={2}>

            <Stack direction="row" gap={2}>

                {edit ? <Link href={edit.href} label={edit.label} tone="button" icon={<Icon name="pencil" size="sm" />} /> : null}

                {actions.map(( action ) => <Button key={action.label} label={action.label} tone={action.tone} busy={busy} icon={<Icon name={action.icon} size="sm" tone={action.tone === "ghost" ? "primary" : "inverse"} />} onPress={action.onPress} />)}

            </Stack>

            {note ? <Text text={note.text} tone={note.tone} size="sm" /> : null}

        </Stack>

    );

}
