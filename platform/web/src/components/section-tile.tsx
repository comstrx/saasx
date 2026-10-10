import Emblem from "@/elements/emblem";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = { href: string; title: string; description: string; icon: string; tone: Tone; status?: string | null };

export default function SectionTile ({ href, title, description, icon, tone, status }: Props) {

    return (

        <Surface as="li" padding={5} radius="xl" interactive>

            <Stack direction="row" align="center" gap={4}>

                <Emblem tone={tone} size="large">{isIconName(icon) ? <Icon name={icon} /> : null}</Emblem>

                <Stack gap={1} grow>

                    <Heading level={3} size="title">

                        <Link href={href} variant="card">{title}</Link>

                    </Heading>

                    {status ? (

                        <Stack direction="row">

                            <Status tone="attention" icon={<Icon name="warning-circle" size="sm" weight="fill" />}>{status}</Status>

                        </Stack>

                    ) : null}

                    <Text size="small" tone="muted" clamp={2}>{description}</Text>

                </Stack>

                <Icon name="caret-end" size="md" tone="muted" />

            </Stack>

        </Surface>

    );

}
