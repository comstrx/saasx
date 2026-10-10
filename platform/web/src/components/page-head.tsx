import type { ReactNode } from "react";
import Emblem from "@/elements/emblem";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string;
    description?: string | null;
    icon?: string | null;
    tone?: Tone;
    level?: 1 | 2;
    back?: { href: string; label: string } | null;
    actions?: ReactNode;
};

export default function PageHead ({ title, description, icon, tone = "teal", level = 1, back, actions }: Props) {

    return (

        <Stack gap={4}>

            {back ? (

                <Stack direction="row">

                    <Link href={back.href} variant="quiet"><Icon name="arrow-start" size="sm" />{back.label}</Link>

                </Stack>

            ) : null}

            <Stack direction="responsive" align="responsive" justify="between" gap={4}>

                <Stack direction="row" align="center" gap={4}>

                    {isIconName(icon) ? <Emblem tone={tone} size="large"><Icon name={icon} /></Emblem> : null}

                    <Stack gap={1}>

                        <Heading level={level} size="h1">{title}</Heading>

                        {description ? <Text tone="muted" measure="readable" wrap="pretty">{description}</Text> : null}

                    </Stack>

                </Stack>

                {actions ? <Stack direction="row" gap={2} wrap fixed>{actions}</Stack> : null}

            </Stack>

        </Stack>

    );

}
