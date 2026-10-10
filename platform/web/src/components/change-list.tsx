import Divider from "@/elements/divider";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Props = {
    rows: readonly { key: string; label: string; before?: string; after: string }[];
    beforeLabel: string; afterLabel: string;
};

export default function ChangeList ({ rows, beforeLabel, afterLabel }: Props) {

    return (

        <Stack gap={4}>

            {rows.map(( row, index ) => (

                <Stack key={row.key} gap={3}>

                    {index ? <Divider /> : null}
                    <Text weight="semibold" size="small">{row.label}</Text>
                    <Grid as="div" columns={row.before === undefined ? 1 : 2} mobileColumns={row.before === undefined ? 1 : 2} gap={4}>

                        {row.before !== undefined ? <Stack gap={1}>

                            <Text size="label" tone="muted">{beforeLabel}</Text>
                            <Text size="small">{`\u2068${row.before}\u2069`}</Text>

                        </Stack> : null}
                        <Stack gap={1}>

                            <Text size="label" tone="muted">{afterLabel}</Text>
                            <Text size="small" weight="medium">{`\u2068${row.after}\u2069`}</Text>

                        </Stack>

                    </Grid>

                </Stack>

            ))}

        </Stack>

    );

}
