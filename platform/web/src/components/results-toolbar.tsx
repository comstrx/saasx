import type { ReactNode } from "react";
import Chip from "@/elements/chip";
import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import ScrollRow from "./scroll-row";

type Toggle = { key: string; label: string; href: string; pressed: boolean };
type Props = {
    title: string;
    note?: string;
    filters?: ReactNode;
    sort?: ReactNode;
    quick?: { label: string; items: readonly Toggle[] };
};

export default function ResultsToolbar ({ title, note, filters, sort, quick }: Props) {

    const chips = quick?.items ?? [];

    return (

        <Stack gap={6}>

            {filters || sort || chips.length ? (

                <Stack direction="row" align="center" gap={3}>

                    {filters}

                    {filters && chips.length ? <Divider direction="vertical" /> : null}

                    <Stack grow>

                        {chips.length ? (

                            <ScrollRow label={quick?.label} gap={2}>

                                {chips.map(( chip ) => (

                                    <Stack as="li" key={chip.key} direction="row">

                                        <Chip href={chip.href} pressed={chip.pressed} scroll={false}>

                                            {chip.pressed ? <Icon name="check" size="sm" weight="bold" /> : null}

                                            {chip.label}

                                        </Chip>

                                    </Stack>

                                ))}

                            </ScrollRow>

                        ) : null}

                    </Stack>

                    {sort}

                </Stack>

            ) : null}

            <Stack direction="row" align="end" justify="between" gap={4} wrap role="status">

                <Heading level={2} size="h2">{title}</Heading>

                {note ? (

                    <Stack direction="row" align="center" gap={2}>

                        <Icon name="tag" size="md" weight="fill" tone="primary" />

                        <Text as="span" size="small" tone="muted">{note}</Text>

                    </Stack>

                ) : null}

            </Stack>

        </Stack>

    );

}
