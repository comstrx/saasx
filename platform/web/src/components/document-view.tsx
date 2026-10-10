import RichText from "@/elements/rich-text";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";

type Props = { content: string; updated: string | null };

export default function DocumentView ({ content, updated }: Props) {

    return (

        <Surface padding={10} radius="xl">

            <Stack gap={6}>

                {updated ? <Text size="small" tone="muted">{updated}</Text> : null}

                <RichText value={content} />

            </Stack>

        </Surface>

    );

}
