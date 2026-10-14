import Emoji from "@/elements/emoji";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Props = { glyph: string; name: string; keywords: string };

export default function EmojiStage ({ glyph, name, keywords }: Props) {

    return (

        <Stack direction="row" gap={3} align="center">

            <Emoji key={glyph} glyph={glyph} size="lg" label={name} />

            <Stack gap={1} fill>

                <Text text={name} size="lg" />

                <Text text={keywords} tone="muted" size="sm" />

            </Stack>

        </Stack>

    );

}
