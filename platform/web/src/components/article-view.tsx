import type { ComponentProps } from "react";
import Breadcrumbs from "@/elements/breadcrumbs";
import Container from "@/elements/container";
import Heading from "@/elements/heading";
import Media from "@/elements/media";
import RichText from "@/elements/rich-text";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import ArticleActions from "./article-actions";
import ArticleDiscussion from "./article-discussion";
import ArticleGrid from "./article-grid";
import PhotoViewer from "./photo-viewer";
import Section from "./section";

type Props = {
    id: number; title: string; description: string | null; image: string | null; content: string;
    trail: ComponentProps<typeof Breadcrumbs>; facts: readonly string[];
    pictures: ComponentProps<typeof PhotoViewer>["pictures"]; direction: "ltr" | "rtl";
    related: ComponentProps<typeof ArticleGrid>["items"];
    actions: Omit<ComponentProps<typeof ArticleActions>, "articleId" | "title">;
    labels: { related: string; discussion: string; gallery: ComponentProps<typeof PhotoViewer>["labels"] };
    login: string;
};

export default function ArticleView ( props: Props ) {

    return (

        <Stack gap={12}>

            <Container width="reading">

                <Stack as="header" gap={5}>

                    <Breadcrumbs {...props.trail} />

                    <Stack gap={3}>

                        <Heading level={1} size="display" wrap="balance">{props.title}</Heading>

                        {props.description ? <Text size="title" tone="muted" wrap="pretty">{props.description}</Text> : null}

                    </Stack>

                    <Stack direction="row" gap={4} wrap>

                        {props.facts.map(( fact ) => <Text key={fact} as="span" size="small" tone="muted">{fact}</Text>)}

                    </Stack>

                </Stack>

            </Container>

            {props.image ? <Media src={props.image} alt="" ratio="wide" radius="large" priority /> : null}

            <Container width="reading">

                <Stack gap={10}>

                    <RichText value={props.content} />

                    <ArticleActions articleId={props.id} title={props.title} {...props.actions} />

                </Stack>

            </Container>

            {props.pictures.length >= 3 ? (

                <PhotoViewer pictures={props.pictures} labels={props.labels.gallery} direction={props.direction} />

            ) : null}

            <Container width="reading">

                <Section id="discussion" title={props.labels.discussion}>

                    <ArticleDiscussion articleId={props.id} login={props.login} />

                </Section>

            </Container>

            {props.related.length ? <ArticleGrid title={props.labels.related} items={props.related} /> : null}

        </Stack>

    );

}
