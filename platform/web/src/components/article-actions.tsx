"use client";

import Button from "@/elements/button";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useArticleActions } from "@/hooks/use-article-actions";
import Icon from "@/icons/icon";
import ReportDialog from "./report-dialog";
import ShareButton from "./share-button";

type Props = {
    articleId: number; title: string; likes: number; dislikes: number; favorite: boolean; login: string;
    labels: {
        helpful: string; like: string; dislike: string; favorite: string; unfavorite: string; failed: string;
        share: { label: string; copied: string; failed: string };
    };
};

export default function ArticleActions ({ articleId, title, likes, dislikes, favorite, login, labels }: Props) {

    const state = useArticleActions({ articleId, likes, dislikes, favorite, login });

    return (

        <Stack direction="responsive" align="center" justify="between" gap={4}>

            <Stack direction="row" align="center" gap={3} wrap>

                <Text weight="semibold">{labels.helpful}</Text>

                <Button
                    variant={state.reaction === "like" ? "subtle" : "outlined"} size="small" rounded="full"
                    aria-pressed={state.reaction === "like"} disabled={state.pending} onClick={() => { void state.react("like"); }}
                >

                    <Icon name="thumbs-up" weight={state.reaction === "like" ? "fill" : "regular"} />{labels.like}

                    <Text as="span" size="label" tone="muted" numeric>{state.likes}</Text>

                </Button>

                <Button
                    variant={state.reaction === "dislike" ? "subtle" : "outlined"} size="small" rounded="full"
                    aria-pressed={state.reaction === "dislike"} disabled={state.pending} onClick={() => { void state.react("dislike"); }}
                >

                    <Icon name="thumbs-down" weight={state.reaction === "dislike" ? "fill" : "regular"} />{labels.dislike}

                    <Text as="span" size="label" tone="muted" numeric>{state.dislikes}</Text>

                </Button>

                {state.failed ? <Text as="span" size="small" tone="danger" role="alert">{labels.failed}</Text> : null}

            </Stack>

            <Stack direction="row" align="center" gap={2}>

                <Button
                    variant="outlined" size="small" rounded="full" aria-pressed={state.saved} disabled={state.pending}
                    onClick={() => { void state.toggle(); }}
                >

                    <Icon name="heart" weight={state.saved ? "fill" : "regular"} tone={state.saved ? "accent" : "inherit"} />

                    {state.saved ? labels.unfavorite : labels.favorite}

                </Button>

                <ShareButton title={title} labels={labels.share} />

                <ReportDialog feature="articles" id={articleId} name={title} look="icon" />

            </Stack>

        </Stack>

    );

}
