"use client";

import type { ComponentProps } from "react";
import type { Data } from "@/api/features";
import Button from "@/elements/button";
import Check from "@/elements/check";
import Dialog from "@/elements/dialog";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useBusySignal } from "@/hooks/use-busy-items";
import { useReviewManager } from "@/hooks/use-review-manager";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { orderDate } from "@/lib/std/orders";
import AttemptRecovery from "./attempt-recovery";
import BulkBar from "./bulk-bar";
import EngagementActions from "./engagement-actions";
import FactList from "./fact-list";
import FormFeedback from "./form-feedback";
import FormRetry from "./form-retry";
import ReplyThread from "./reply-thread";
import ReviewFields from "./review-fields";
import ReviewList from "./review-list";

type Props = {
    items: readonly Data<"orders", "review">[]; scope: string; catalogId?: number;
    onChanged: () => void; onBusy?: ( busy: boolean ) => void; publication?: boolean;
    selection?: { ids: readonly number[]; pick: ( id: number, value: boolean ) => void; label: ( title: string ) => string } | null;
    bulk?: ComponentProps<typeof BulkBar> | null; layout?: "stack" | "pairs";
};

export default function ReviewManager ({
    items, scope, catalogId, onChanged, onBusy, publication = true, selection, bulk, layout = "stack",
}: Props) {

    const state = useReviewManager(items, scope, catalogId, onChanged);
    const { t, form, mutation, active } = state;
    const locale = useLocale();
    const feedback = useTranslations("feedback");
    const aspect = useTranslations("feedback.aspects");
    const common = useTranslations("common");

    const busy = !!mutation.attempt || mutation.pending || mutation.blocked || state.threads.size > 0;

    useBusySignal(busy, onBusy);

    if ( !items.length && !state.archived.length && !active && !state.message && !state.error ) return null;

    return (

        <Stack gap={5}>

            {bulk ? <BulkBar {...bulk} /> : null}

            <FormFeedback id={form.id("result")} message={state.message} error={!active ? state.error : null} />
            <ReviewList layout={layout} items={items.map(( row ) => ({
                id: row.id, name: row.user?.name || feedback("guest"), image: row.user?.image,
                title: row.title, content: row.content, date: orderDate(row.created_at, locale) ?? null,
                rating: row.rating == null ? null : feedback("ratingValue", { rating: String(row.rating) }),
                stars: row.rating == null ? null : Number(row.rating),
                status: publication ? feedback(row.published ? "published" : "private") : undefined,
                details: row.scores && Object.keys(row.scores).length ? <FactList compact items={
                    Object.entries(row.scores).flatMap(( [key, score] ) => score == null ? [] : [{
                        key, term: aspect.has(key as Parameters<typeof aspect>[0])
                            ? aspect(key as Parameters<typeof aspect>[0]) : feedback("criterion"),
                        detail: feedback("ratingValue", { rating: String(score) }),
                    }])
                } /> : undefined,
                discussion: <ReplyThread
                    rootId={row.id} count={row.replies} scope={`${scope}.review.${row.id}`}
                    disabled={mutation.locked || state.threads.size > 0 && !state.threads.has(["thread", row.id].join("."))}
                    onBusy={( busy ) => state.threadBusy(["thread", row.id].join("."), busy)}
                />,
                actions: <Stack direction="row" gap={1} wrap align="start">

                    <Stack direction="row" gap={2} wrap align="center">

                        {selection ? <Check
                            id={`review-select-${row.id}`} label={selection.label(row.title || feedback("guest"))} labelVisible={false}
                            checked={selection.ids.includes(row.id)} onChange={( value ) => selection.pick(row.id, value)}
                        /> : null}
                        {state.allowed("update", row) ? <Button
                            variant="ghost" disabled={!state.ready || mutation.locked || state.threads.size > 0}
                            onClick={() => state.choose("update", row)}>{t("edit")}</Button> : null}
                        {state.allowed("remove", row) ? <Button
                            variant="ghost" disabled={!state.ready || mutation.locked || state.threads.size > 0}
                            onClick={() => state.choose("remove", row)}>{t("remove")}</Button> : null}

                    </Stack>
                    <EngagementActions
                        feature="reviews" id={row.id} scope={scope} name={row.user?.name || feedback("guest")}
                        likes={row.likes} dislikes={row.dislikes} onChanged={onChanged}
                        disabled={mutation.locked || state.threads.size > 0 && !state.threads.has(["engagement", row.id].join("."))}
                        onBusy={( busy ) => state.threadBusy(["engagement", row.id].join("."), busy)}
                    />

                </Stack>,
            }))} />
            {state.archived.length ? <Stack gap={3}>

                <Text size="small" tone="muted">{t("archiveHint")}</Text>
                {state.archived.map(( id ) => <Stack key={id} direction="row" gap={3} justify="between" align="center" wrap>

                    <Text size="small" tone="muted">{t("removedReference", { id })}</Text>
                    {state.canRestore ? <Button variant="outlined" disabled={!state.ready || mutation.locked || state.threads.size > 0}
                        onClick={() => state.restore(id)}>{t("restore")}</Button> : null}

                </Stack>)}

            </Stack> : null}
            <Dialog
                open={!!active} onOpenChange={( open ) => { if ( !open ) state.close(); }}
                title={t(active === "update" ? "editTitle" : active === "remove" ? "removeTitle" : "restoreTitle")}
                close={t("cancel")} dismissible={!mutation.locked}
            >

                {mutation.attempt || mutation.blocked ? <AttemptRecovery
                    title={t("recoveryTitle")} description={t(mutation.blocked ? "blocked" : "recovery")}
                    label={t("retry")} pending={mutation.pending} blocked={mutation.blocked} onRetry={state.submit}
                /> : active ? <Form
                    noValidate pending={mutation.pending} onSubmit={( event ) => { event.preventDefault(); void state.submit(); }}
                >

                    {active === "update" ? <>

                        <ReviewFields
                            optionalRating ratingHint={feedback("currentRating", { rating: String(state.selected?.review.rating ?? 0) })}
                            values={form.values} errors={form.errors} aspects={state.aspects} disabled={mutation.locked}
                            id={form.id} onChange={form.change}
                        />
                        {state.catalog.error ? <FormRetry
                            id={form.id("criteria")} message={feedback("criteriaFailed")}
                            label={common("retry")} onRetry={state.catalog.reload}
                        /> : null}

                    </> : <Text size="small" tone="muted">{t(active === "remove" ? "removeBody" : "restoreBody")}</Text>}
                    <Button variant="outlined" disabled={mutation.locked} onClick={state.close}>{t("cancel")}</Button>
                    <Button type="submit" pending={mutation.pending} disabled={mutation.locked || !state.ready}>
                        {t(active === "update" ? "save" : active === "remove" ? "confirmRemove" : "confirmRestore")}
                    </Button>

                </Form> : null}
                <FormFeedback id={form.id("failure")} error={state.error} />

            </Dialog>

        </Stack>

    );

}
