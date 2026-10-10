"use client";

import Button from "@/elements/button";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useReplyThread } from "@/hooks/use-reply-thread";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import AttemptRecovery from "./attempt-recovery";
import FormFeedback from "./form-feedback";
import FormRetry from "./form-retry";
import MessageFields from "./message-fields";
import ReplyManager from "./reply-manager";
import SectionSkeleton from "./section-skeleton";

type Props = {
    source?: "reviews" | "comments"; rootId: number; scope: string; count?: number | null; disabled?: boolean;
    onBusy?: ( busy: boolean ) => void;
};

export default function ReplyThread ( props: Props ) {

    const state = useReplyThread(props);
    const { t, form, mutation } = state;
    const common = useTranslations("common");

    return (

        <Stack gap={4}>

            <Stack direction="row">
                <Button variant="ghost" aria-expanded={state.expanded} aria-controls={form.id("thread")}
                    disabled={mutation.locked && state.expanded} onClick={state.toggle}>
                    <Icon name={props.count ? "chat" : "reply"} />{t(state.expanded ? "hide" : "show", { count: props.count ?? 0 })}
                </Button>
            </Stack>
            <Surface hidden={!state.expanded} tone="clear" border="start" radius="none" padding={3}>

                <Stack id={form.id("thread")} gap={5}>

                    {state.request.error ? <FormRetry
                        id={form.id("read")} message={t("loadFailed")} label={common("retry")} onRetry={state.request.reload}
                    /> : state.request.loading && !state.visible.length ? <SectionSkeleton /> : null}
                    <ReplyManager items={state.visible} scope={props.scope} disabled={props.disabled || mutation.locked}
                        onChanged={state.changed} onBusy={state.setManagedBusy} onReply={state.allowed ? state.respond : undefined} />
                    {!state.request.loading && !state.request.error && !state.visible.length
                        ? <Text size="small" tone="muted">{t("empty")}</Text> : null}
                    {state.page > 1 || state.hasNext ? <Stack direction="row" align="center" justify="between" gap={3} wrap>

                        <Button variant="outlined"
                            disabled={state.request.loading || props.disabled || mutation.locked || state.managedBusy || state.page <= 1}
                            onClick={() => state.setPage(state.page - 1)}>{common("previous")}</Button>
                        <Text size="small" tone="muted">{t("page", { page: state.page })}</Text>
                        <Button variant="outlined"
                            disabled={state.request.loading || props.disabled || mutation.locked || state.managedBusy || !state.hasNext}
                            onClick={() => state.setPage(state.page + 1)}>{common("next")}</Button>

                    </Stack> : null}
                    <FormFeedback id={form.id("result")} message={state.sent ? t("sent") : null} />
                    {mutation.attempt || mutation.blocked ? <AttemptRecovery
                        title={t("recoveryTitle")} description={t(mutation.blocked ? "blocked" : "recovery")} label={t("retry")}
                        pending={mutation.pending} blocked={mutation.blocked} onRetry={state.send}
                    /> : state.allowed ? <Form
                        noValidate pending={mutation.pending} onSubmit={( event ) => { event.preventDefault(); void state.send(); }}
                    >

                        {state.target ? <Stack gap={2}>

                            <Text size="small">{t("inReplyTo", { name: state.target.name })}</Text>
                            <Stack direction="row"><Button variant="ghost" onClick={() => state.respond()}>
                                {t("replyToReview")}
                            </Button></Stack>

                        </Stack> : null}
                        <MessageFields title={t("title")} content={t("content")} values={form.values}
                            errors={form.errors} disabled={props.disabled || mutation.locked || state.managedBusy}
                            id={form.id} onChange={form.change} />
                        <Button type="submit" pending={mutation.pending} disabled={props.disabled || mutation.locked || state.managedBusy}>
                            {t("send")}
                        </Button>

                    </Form> : null}
                    <FormFeedback id={form.id("failure")} error={state.error} />

                </Stack>

            </Surface>

        </Stack>

    );

}
