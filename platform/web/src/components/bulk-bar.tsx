import Button from "@/elements/button";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { type IconName } from "@/icons/icon";

type Action = { key: string; label: string; icon: IconName; danger?: boolean; onSelect: () => void };
type Props = { count: string; clear: string; busy?: boolean; actions: readonly Action[]; onClear: () => void };

export default function BulkBar ({ count, clear, busy, actions, onClear }: Props) {

    return (

        <Stack direction="row" align="center" gap={1} wrap>

            <Text size="small" weight="semibold">{count}</Text>

            {actions.map(( action ) => (

                <Button
                    key={action.key}
                    variant={action.danger ? "danger" : "ghost"}
                    size="small"
                    rounded="full"
                    pending={action.danger && busy}
                    disabled={busy}
                    onClick={action.onSelect}
                >

                    <Icon name={action.icon} />{action.label}

                </Button>

            ))}

            <Button variant="ghost" size="small" rounded="full" disabled={busy} onClick={onClear}>{clear}</Button>

        </Stack>

    );

}
