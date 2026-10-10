import type { ReactNode } from "react";
import Emblem from "@/elements/emblem";
import Link from "@/elements/link";
import Skeleton from "@/elements/skeleton";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { type IconName } from "@/icons/icon";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    label: string;
    value: ReactNode | null;
    icon: IconName;
    tone: Tone;
    caption?: string | null;
    href?: string | null;
    loading?: boolean;
};

export default function StatTile ({ label, value, icon, tone, caption, href, loading }: Props) {

    return (

        <Surface as="li" padding={5} radius="xl" interactive={Boolean(href)} contained>

            <Stack direction="fluid" align="lead" gap={4}>

                <Emblem tone={tone} size="large"><Icon name={icon} /></Emblem>

                <Stack gap={1} grow>

                    <Text as="span" size="small" tone="muted">

                        {href ? <Link href={href} variant="card">{label}</Link> : label}

                    </Text>

                    {loading ? <Skeleton shape="title" width="half" /> : (

                        <Text as="span" size="title" weight="bold" numeric>{value ?? "—"}</Text>

                    )}

                    {caption ? <Text as="span" size="label" tone="muted">{caption}</Text> : null}

                </Stack>

            </Stack>

        </Surface>

    );

}
