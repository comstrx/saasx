"use client";

import type { reply } from "@/api/features/reviews";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useReplyManager } from "@/hooks/use-reply-manager";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import type { z } from "@/lib/providers/schema";
import type { DiscussionRow } from "@/lib/std/discussion";
import { orderDate } from "@/lib/std/orders";
import AttemptRecovery from "./attempt-recovery";
import EngagementActions from "./engagement-actions";
import FormFeedback from "./form-feedback";
import MessageFields from "./message-fields";
import ReviewList from "./review-list";

type Reply = z.output<typeof reply>;
type Props = {
    items: readonly DiscussionRow<Reply>[]; scope: string; disabled?: boolean;
    onChanged: ( change?: { item?: Reply; removed?: number } ) => void;
    onBusy?: ( busy: boolean ) => void; onReply?: ( item: Reply ) => void;
};

export default function ReplyManager ( props: Props ) {

    const state = useReplyManager(props);
    const { t, form, mutation } = state;
    const text = useTranslations("discussion");
    const locale = useLocale();

    if ( !props.items.length && !state.archived.length && !state.active && !state.message && !state.error ) return null;

    return (

        <Stack gap={4}>

            <FormFeedback id={form.id("result")} message={state.message} error={!state.active ? state.error : null} />
            <ReviewList dividers={false} items={props.items.map(( { item, parent } ) => ({
                id: item.id, name: item.user?.name || text("guest"), image: item.user?.image,
                title: item.title, content: item.content, date: orderDate(item.created_at, locale) ?? null, rating: null,
                status: parent ? text("inReplyTo", { name: parent.name || text("guest") }) : undefined,
                actions: <Stack direction="row" gap={1} wrap align="start">

                    <Stack direction="row" gap={1} wrap>

                        {props.onReply ? <Button variant="ghost" disabled={state.locked} onClick={() => props.onReply?.(item)}>
                            {text("reply")}
                        </Button> : null}
                        {state.allowed("update", item) ? <Button variant="ghost" disabled={state.locked}
                            onClick={() => state.choose("update", item)}>{t("edit")}</Button> : null}
                        {state.allowed("remove", item) ? <Button variant="ghost" disabled={state.locked}
                            onClick={() => state.choose("remove", item)}>{t("remove")}</Button> : null}

                    </Stack>
                    <EngagementActions
                        feature="replies" id={item.id} scope={props.scope} name={item.user?.name || text("guest")}
                        likes={item.likes} dislikes={item.dislikes} onChanged={props.onChanged}
                        disabled={props.disabled || mutation.locked || state.children.busy && !state.children.items.has(String(item.id))}
                        onBusy={( busy ) => state.children.update(String(item.id), busy)}
                    />

                </Stack>,
            }))} />
            {state.archived.length ? <Stack gap={3}>

                <Text size="small" tone="muted">{t("archiveHint")}</Text>
                {state.archived.map(( id ) => <Stack key={id} direction="row" align="center" justify="between" gap={3} wrap>

                    <Text size="small" tone="muted">{t("removedReference", { id })}</Text>
                    {state.canRestore ? <Button variant="outlined" disabled={state.locked}
                        onClick={() => state.restore(id)}>{t("restore")}</Button> : null}

                </Stack>)}

            </Stack> : null}
            <Dialog
                open={!!state.active} onOpenChange={( open ) => { if ( !open ) state.close(); }}
                title={t(state.active === "update" ? "editTitle" : state.active === "remove" ? "removeTitle" : "restoreTitle")}
                close={t("cancel")} dismissible={!mutation.locked}
            >

                {mutation.attempt || mutation.blocked ? <AttemptRecovery
                    title={t("recoveryTitle")} description={t(mutation.blocked ? "blocked" : "recovery")}
                    label={t("retry")} pending={mutation.pending} blocked={mutation.blocked} onRetry={state.submit}
                /> : state.active ? <Form
                    noValidate pending={mutation.pending} onSubmit={( event ) => { event.preventDefault(); void state.submit(); }}
                >

                    {state.active === "update" ? <MessageFields
                        title={text("title")} content={text("content")} values={form.values}
                        errors={form.errors} disabled={state.locked} id={form.id} onChange={form.change}
                    /> : <Text size="small" tone="muted">{t(state.active === "remove" ? "removeBody" : "restoreBody")}</Text>}
                    <Button variant="outlined" disabled={state.locked} onClick={state.close}>{t("cancel")}</Button>
                    <Button type="submit" pending={mutation.pending} disabled={state.locked}>
                        {t(state.active === "update" ? "save" : state.active === "remove" ? "confirmRemove" : "confirmRestore")}
                    </Button>

                </Form> : null}
                <FormFeedback id={form.id("failure")} error={state.error} />

            </Dialog>

        </Stack>

    );

}
