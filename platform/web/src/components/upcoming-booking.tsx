import Badge from "@/elements/badge";
import DateTile from "@/elements/date-tile";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Media from "@/elements/media";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import Section from "./section";

type Props = {
    name: string; href: string; image?: string | null; reference: string; action: string; countdown: string; all: string;
    status: { label: string; tone: "neutral" | "positive" | "attention" | "negative" };
    when: { month: string; day: string; weekday: string; label: string };
    labels: { title: string; body: string; all: string };
};

export default function UpcomingBooking ( props: Props ) {

    return (

        <Section
            title={props.labels.title} description={props.labels.body}
            action={{ href: props.all, label: props.labels.all }}
        >

            <Surface padding={4} radius="xl" elevation="medium" interactive>

                <Stack direction="row" align="center" gap={5}>

                    <Stack visibility="tablet" fixed>

                        <Media src={props.image ?? null} alt="" ratio="square" width="thumb" />

                    </Stack>

                    <DateTile
                        month={props.when.month} day={props.when.day} weekday={props.when.weekday} label={props.when.label} size="large"
                    />

                    <Stack gap={2} grow>

                        <Stack direction="row" align="center" gap={2} wrap>

                            <Badge tone="teal"><Icon name="hourglass" weight="fill" />{props.countdown}</Badge>

                            <Status tone={props.status.tone}>{props.status.label}</Status>

                        </Stack>

                        <Heading level={3} size="title" clamp={1}>

                            <Link href={props.href} variant="card" dir="auto">{props.name}</Link>

                        </Heading>

                        <Text size="small" tone="muted">{props.when.label} · {props.reference}</Text>

                    </Stack>

                    <Stack visibility="tablet" fixed>

                        <Text as="span" size="small" weight="semibold" tone="accent">{props.action}</Text>

                    </Stack>

                </Stack>

            </Surface>

        </Section>

    );

}
