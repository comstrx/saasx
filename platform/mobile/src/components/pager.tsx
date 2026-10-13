import Button from "@/elements/button";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons";

type Props = { page: number; pages: number; label: string; previous: string; next: string; onPage: ( page: number ) => void };

export default function Pager ({ page, pages, label, previous, next, onPage }: Props) {
    if ( pages <= 1 ) return null;

    return (

        <Stack direction="row" gap={2} align="between">

            <Button label={previous} tone="ghost" disabled={page <= 1} icon={<Icon name="chevronStart" size="sm" tone="primary" />} onPress={() => onPage(page - 1)} />

            <Text text={label} tone="muted" size="sm" />

            <Button label={next} tone="ghost" disabled={page >= pages} icon={<Icon name="chevronEnd" size="sm" tone="primary" />} onPress={() => onPage(page + 1)} />

        </Stack>

    );
}
