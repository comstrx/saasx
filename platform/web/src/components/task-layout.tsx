import type { ComponentProps, ReactNode } from "react";
import Emblem from "@/elements/emblem";
import Flow from "@/elements/flow";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Split from "@/elements/split";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    title: string; description?: string; back?: { href: string; label: string } | null;
    aside: ReactNode; label: string; children: ReactNode; asideFirst?: boolean; progress?: ComponentProps<typeof Flow>;
    icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red"; support?: ReactNode;
};

export default function TaskLayout ({
    title, description, back, aside, label, children, asideFirst, progress, icon, tone = "teal", support,
}: Props) {

    return (

        <Stack gap={8}>

            <Stack gap={3}>

                {back ? (

                    <Stack direction="row">

                        <Link href={back.href} variant="quiet"><Icon name="arrow-start" size="sm" />{back.label}</Link>

                    </Stack>

                ) : null}

                {progress ? <Flow {...progress} /> : null}

                <Stack direction="row" align="center" gap={4}>

                    {isIconName(icon) ? <Emblem tone={tone} size="large"><Icon name={icon} /></Emblem> : null}

                    <Stack gap={1}>

                        <Heading level={1} size="h1">{title}</Heading>

                        {description ? <Text tone="muted" measure="short">{description}</Text> : null}

                    </Stack>

                </Stack>

            </Stack>

            <Split aside={support ? <Stack gap={4}>{aside}{support}</Stack> : aside} label={label} asideFirst={asideFirst}>

                {children}

            </Split>

        </Stack>

    );

}
