"use client";

import Button from "@/elements/button";
import Form from "@/elements/form";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useArticleDiscussion } from "@/hooks/use-article-discussion";
import { useTranslations } from "@/lib/providers/intl";
import EngagementActions from "./engagement-actions";
import FormFeedback from "./form-feedback";
import FormRetry from "./form-retry";
import MessageFields from "./message-fields";
import MoreButton from "./more-button";
import ReplyThread from "./reply-thread";
import ReviewList from "./review-list";
import SectionSkeleton from "./section-skeleton";
import StateNotice from "./state-notice";

type Props = { articleId: number; login: string };

export default function ArticleDiscussion ({ articleId, login }: Props) {

    const state = useArticleDiscussion(articleId, login);
    const { t, form } = state;
    const common = useTranslations("common");

    return (

        <Stack gap={6}>

            {state.count ? <Text tone="muted">{state.count}</Text> : null}

            <Surface padding={5} radius="lg">

                {!state.ready ? <SectionSkeleton /> : state.signedIn ? (

                    <Form pending={state.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void state.send(); }}>

                        <MessageFields
                            content={t("add")} hint={t("addHint")} values={form.values} errors={form.errors} id={form.id}
                            disabled={state.pending} onChange={form.change}
                        />

                        <FormFeedback id={form.id("failure")} error={state.error} message={state.notice} />

                        <Button type="submit" pending={state.pending}>{t(state.pending ? "posting" : "post")}</Button>

                    </Form>

                ) : (

                    <Stack direction="responsive" align="center" justify="between" gap={4}>

                        <Text tone="muted">{t("join")}</Text>

                        <Link href={state.login} variant="filled" size="small">{t("signIn")}</Link>

                    </Stack>

                )}

            </Surface>

            {state.failed ? (

                <FormRetry id={`article-${articleId}-comments`} message={t("unavailable")} label={common("retry")} onRetry={state.reload} />

            )
                : state.loading ? <SectionSkeleton /> : state.items.length ? (

                    <ReviewList items={state.items.map(( item ) => ({
                        ...item,
                        actions: <EngagementActions
                            feature="comments" id={item.id} scope={`article.${articleId}.comment.${item.id}`} name={item.name}
                            likes={item.likes} dislikes={item.dislikes}
                        />,
                        discussion: <ReplyThread
                            source="comments" rootId={item.id} count={item.replies} scope={`article.${articleId}.thread.${item.id}`}
                        />,
                    }))} />

                ) : <StateNotice compact title={t("emptyTitle")} description={t("emptyBody")} />}

            <MoreButton label={t("more")} onClick={state.more} />

        </Stack>

    );

}
