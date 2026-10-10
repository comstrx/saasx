import type { ReactNode } from "react";
import Art from "@/elements/art";
import Emblem from "@/elements/emblem";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = {
    level?: 1 | 2;
    art?: string;
    title: string;
    description: string;
    kind?: "empty" | "error";
    chips?: ReactNode;
    action?: ReactNode;
    reference?: { label: string; code: string } | null;
    compact?: boolean;
    plain?: boolean;
};

export default function StateNotice ({
    level = 2, art, title, description, kind = "empty", chips, action, reference, compact, plain,
}: Props) {

    const body = (

        <Stack gap={5} align="center" inset={plain ? "large" : "none"}>

            {art ? <Art src={art} size={compact ? "medium" : "large"} glow /> : (

                <Emblem tone={kind === "error" ? "ember" : "accent"} size="large" shape="round">

                    <Icon name={kind === "error" ? "warning" : "search"} />

                </Emblem>

            )}

            <Stack gap={2} align="center">

                <Heading level={level} size="h3" align="center">{title}</Heading>

                <Text size="value" tone="muted" measure="narrow" align="center" wrap="pretty">{description}</Text>

            </Stack>

            {chips ? <Stack direction="row" gap={2} justify="center" wrap>{chips}</Stack> : null}

            {action ? <Stack direction="row" gap={3} justify="center" wrap>{action}</Stack> : null}

            {reference ? (

                <Text size="label" tone="muted" align="center">

                    {reference.label} <Text as="span" size="label" weight="semibold" numeric>{reference.code}</Text>

                </Text>

            ) : null}

        </Stack>

    );

    return plain ? body : <Surface padding={compact ? 6 : 10} radius="xl">{body}</Surface>;

}
