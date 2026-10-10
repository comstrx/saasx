"use client";

import { useId } from "react";
import type { Data } from "@/api/features";
import Accordion from "@/elements/accordion";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import { useRead } from "@/hooks/use-operation";
import { useOrderAmendments } from "@/hooks/use-order-amendments";
import { useTranslations } from "@/lib/providers/intl";
import AmendmentForm from "./amendment-form";
import AmendmentSummary from "./amendment-summary";
import AttemptRecovery from "./attempt-recovery";
import FormFeedback from "./form-feedback";
import FormRetry from "./form-retry";
import FormSection from "./form-section";
import SectionSkeleton from "./section-skeleton";

type Props = { order: Data<"orders", "view">; onChanged: () => void };

export default function OrderAmendments ({ order, onChanged }: Props) {

    const t = useTranslations("amendments");
    const common = useTranslations("common");
    const success = useTranslations("amendments.success");
    const id = useId();
    const state = useOrderAmendments(order, onChanged, `${id}-result`);
    const { current, mutation, history, decision } = state;
    const product = useRead("products", "order", { productId: order.catalog?.id ?? 0 },
        { enabled: state.editing && !!order.catalog?.id && !state.recovering });
    const records = (history.data ?? []).filter(( row ) => row.id !== current?.id);
    const needsQuestions = [current, ...records].some(( row ) => Array.isArray(row?.changes?.answers));
    const catalog = useRead("products", "view", { productId: order.catalog?.id ?? 0 },
        { enabled: state.allowed && !!order.catalog?.id && needsQuestions });
    const questions = catalog.data?.questions ?? [];
    const fault = mutation.error;
    const unavailable = state.unknown || !order.amendment_token;
    const recovery = state.recovering || mutation.blocked;

    if ( !state.allowed && !recovery ) return null;

    return (

        <FormSection title={t("title")} description={t("description")}>

            {state.done ? <FormFeedback id={`${id}-result`} message={success(state.done)} /> : null}

            {recovery ? <AttemptRecovery
                title={t("recoveryTitle")} description={t(mutation.blocked ? "blocked" : "recovery")}
                label={t("retry")} pending={mutation.pending} blocked={mutation.blocked} onRetry={state.retry}
            /> : null}

            {current ? <Stack gap={5}>

                <AmendmentSummary proposal={current} order={order} questions={questions} />
                {current.status === "proposed" ? <Text size="small" tone="muted">
                    {t(state.expired ? "expired" : current.side === "buyer" ? "waiting" : "incoming")}
                </Text> : null}
                {current.side === "vendor" && unavailable ? <Text size="small" tone="danger">{t("incomplete")}</Text> : null}
                <Stack direction="row" gap={3} wrap>

                    {state.canAccept ? <Button disabled={mutation.locked} onClick={() => state.choose("acceptAmendment")}>
                        {t("review")}
                    </Button> : null}
                    {state.canDecline ? <Button
                        variant="outlined" disabled={mutation.locked} onClick={() => state.choose("declineAmendment")}
                    >{t(current.side === "buyer" ? "withdraw" : "decline")}</Button> : null}

                </Stack>

            </Stack> : order.amendment ? state.targeted.loading || history.loading ? <SectionSkeleton />
                : <FormRetry id={`${id}-current`} message={t("loadFailed")} label={common("retry")} onRetry={state.refresh} />
                : null}

            {!state.editing && !recovery && order.can_amend && order.catalog?.id ? <Button
                variant="outlined" onClick={state.edit} disabled={!mutation.ready}
            >{t("edit")}</Button> : null}

            {state.editing && !recovery ? <Stack gap={4}>

                {product.loading ? <SectionSkeleton /> : product.error || !product.data ? (
                    <FormRetry id={`${id}-product`} message={t("loadFailed")} label={common("retry")} onRetry={product.reload} />
                ) : <AmendmentForm
                    order={order} product={product.data.product} mutation={mutation}
                    onDone={() => state.complete("amend")} onCancel={state.close}
                />}
                {!product.data ? <Button variant="ghost" onClick={state.close}>{t("back")}</Button> : null}

            </Stack> : null}

            {history.error ? <FormRetry
                id={`${id}-history`} message={t("loadFailed")} label={common("retry")} onRetry={history.reload}
            /> : history.loading ? <SectionSkeleton /> : records.length ? <Accordion
                items={records.map(( row ) => ({
                    key: String(row.id), title: t("reference", { id: row.id }),
                    body: <AmendmentSummary proposal={row} questions={questions} />,
                }))}
            /> : !current && !order.amendment && !state.editing ? <Text size="small" tone="muted">{t("emptyHistory")}</Text> : null}

            {state.page > 1 || state.hasNext ? <Stack direction="row" align="center" justify="between" gap={3} wrap>

                <Button
                    variant="outlined" disabled={history.loading || state.page <= 1} onClick={() => state.setPage(state.page - 1)}
                >{common("previous")}</Button>
                <Text size="small" tone="muted">{t("page", { page: state.page })}</Text>
                <Button
                    variant="outlined" disabled={history.loading || !state.hasNext} onClick={() => state.setPage(state.page + 1)}
                >{common("next")}</Button>

            </Stack> : null}

            <Dialog
                open={!!decision && !recovery} onOpenChange={( open ) => { if ( !open ) state.close(); }}
                title={t(decision === "acceptAmendment" ? "review" : current?.side === "buyer" ? "withdraw" : "decline")}
                close={t("back")} dismissible={!mutation.locked}
            >

                <Form noValidate pending={mutation.pending} onSubmit={( event ) => { event.preventDefault(); void state.submit(); }}>

                    {decision === "acceptAmendment" && current ? (
                        <AmendmentSummary proposal={current} order={order} questions={questions} />
                    ) : null}
                    <Text size="small">{t(decision === "acceptAmendment" ? "settlement" : "declineHint")}</Text>
                    {decision === "declineAmendment" ? <Textarea
                        id={`${id}-notes`} label={t("notes")} value={state.notes} maxLength={3000} rows={3}
                        disabled={mutation.locked} dir="auto" onChange={( event ) => state.setNotes(event.target.value)}
                    /> : null}
                    <FormFeedback
                        id={`${id}-failure`} error={fault ? Object.values(fault.errors).flat()[0] || t("failed") : null}
                        message={decision === "acceptAmendment" && !state.canAccept ? t("incomplete") : null}
                    />
                    <Button
                        type="submit" pending={mutation.pending}
                        disabled={mutation.locked || (decision === "acceptAmendment" ? !state.canAccept : !state.canDecline)}
                    >{t(decision === "acceptAmendment" ? "accept" : current?.side === "buyer" ? "withdraw" : "decline")}</Button>
                    <Button variant="outlined" disabled={mutation.locked} onClick={state.close}>{t("back")}</Button>

                </Form>

            </Dialog>

        </FormSection>

    );

}
