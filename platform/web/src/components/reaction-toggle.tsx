"use client";

import Button from "@/elements/button";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { type Reacting, useReaction } from "@/hooks/use-reaction";
import Icon from "@/icons/icon";

type Props = { feature: Reacting; id: number; labels: { question: string; like: string; dislike: string } };

export default function ReactionToggle ({ feature, id, labels }: Props) {

    const state = useReaction(feature, id);

    return (

        <Stack direction="row" align="center" justify="between" gap={3} wrap>

            <Text as="span" size="small" weight="semibold">{labels.question}</Text>

            <Stack direction="row" gap={2} role="group" aria-label={labels.question}>

                {(["like", "dislike"] as const).map(( value ) => (

                    <Button
                        key={value}
                        variant={state.chosen === value ? "subtle" : "outlined"}
                        size="small"
                        rounded="full"
                        aria-pressed={state.chosen === value}
                        disabled={!state.ready || state.pending}
                        onClick={() => { void state.choose(value); }}
                    >

                        <Icon name={value === "like" ? "thumbs-up" : "thumbs-down"} weight={state.chosen === value ? "fill" : "regular"} />

                        {labels[value]}

                    </Button>

                ))}

            </Stack>

        </Stack>

    );

}
