"use client";

import Emoji from "@/elements/emoji";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Props = { glyph: string; name: string; keywords: string };

export default function EmojiStage ({ glyph, name, keywords }: Props) {

    return (

        <Stack gap={2} align="center">

            <Emoji key={glyph} glyph={glyph} context="reaction" active size="xl" />

            <Text text={name} size="lg" />

            <Text text={keywords} tone="muted" size="sm" />

        </Stack>

    );

}
