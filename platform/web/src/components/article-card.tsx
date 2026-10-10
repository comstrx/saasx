import Card from "@/elements/card";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Media from "@/elements/media";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = {
    title: string;
    description: string | null;
    image: string | null;
    date: string | null;
    comments: string;
    href: string | null;
};

export default function ArticleCard ({ title, description, image, date, comments, href }: Props) {

    return (

        <Card media={<Media src={image} alt="" ratio="wide" zoom />}>

            <Stack direction="row" align="center" gap={3}>

                {date ? <Text as="span" size="label" tone="muted">{date}</Text> : null}

                <Stack direction="row" align="center" gap={1}>

                    <Icon name="chat" size="sm" tone="muted" />

                    <Text as="span" size="label" tone="muted">{comments}</Text>

                </Stack>

            </Stack>

            <Heading level={3} size="title" clamp={2}>

                {href ? <Link href={href} variant="card" dir="auto">{title}</Link> : title}

            </Heading>

            {description ? <Text size="small" tone="muted" clamp={2} dir="auto">{description}</Text> : null}

        </Card>

    );

}
