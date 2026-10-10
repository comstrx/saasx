import type { ReactNode } from "react";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Reveal from "@/elements/reveal";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = {
    id?: string;
    title?: string;
    description?: string;
    action?: { href: string; label: string };
    level?: 2 | 3;
    tools?: ReactNode;
    children: ReactNode;
};

export default function Section ({ id, title, description, action, level = 2, tools, children }: Props) {

    return (

        <Reveal>

            <Stack as="section" id={id} gap={6} aria-label={title}>

                {title || action || tools ? (

                    <Stack direction="row" align="end" justify="between" gap={4}>

                        <Stack gap={1}>

                            {title ? <Heading level={level} size={level === 2 ? "h2" : "h3"}>{title}</Heading> : null}

                            {description ? <Text tone="muted" measure="short">{description}</Text> : null}

                        </Stack>

                        <Stack direction="row" align="center" gap={2} fixed>

                            {tools}

                            {action ? (

                                <Link href={action.href} variant="outlined" size="small" shape="pill">

                                    {action.label}<Icon name="caret-end" />

                                </Link>

                            ) : null}

                        </Stack>

                    </Stack>

                ) : null}

                {children}

            </Stack>

        </Reveal>

    );

}
