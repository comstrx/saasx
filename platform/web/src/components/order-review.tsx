"use client";

import type { Data } from "@/api/features";
import Button from "@/elements/button";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useOrderReview } from "@/hooks/use-order-review";
import { useTranslations } from "@/lib/providers/intl";
import AttemptRecovery from "./attempt-recovery";
import FormFeedback from "./form-feedback";
import FormRetry from "./form-retry";
import FormSection from "./form-section";
import ReviewFields from "./review-fields";
import ReviewManager from "./review-manager";
import SectionSkeleton from "./section-skeleton";

type Props = { order: Data<"orders", "view">; onChanged: () => void };

export default function OrderReview ({ order, onChanged }: Props) {

    const state = useOrderReview(order, onChanged);
    const { t, form, mutation } = state;
    const common = useTranslations("common");
    const quiet = !state.canWrite && !state.rows.length && !state.posted && !state.recovering && !state.open
        && !state.history.loading && !state.history.error;

    if ( quiet ) return null;

    return (

        <FormSection title={t("title")} description={t("description")}>

            {state.posted ? <FormFeedback
                id={form.id("result")} message={t(state.posted.published ? "savedPublic" : "savedPrivate")}
            /> : null}
            {state.recovering ? <AttemptRecovery
                title={t("recoveryTitle")} description={t(mutation.blocked ? "blocked" : "recovery")}
                label={t("retry")} pending={mutation.pending} blocked={mutation.blocked} onRetry={state.send}
            /> : state.open ? <Form
                noValidate pending={mutation.pending} onSubmit={( event ) => { event.preventDefault(); void state.send(); }}
            >

                <Text size="small" tone="muted">{t("publishing")}</Text>
                <ReviewFields
                    values={state.values} errors={form.errors} aspects={state.aspects} disabled={mutation.locked}
                    id={form.id} onChange={form.change}
                />
                {state.catalog.loading ? <Text size="small" tone="muted" role="status">{t("criteriaLoading")}</Text> : null}
                {state.catalog.error ? <FormRetry
                    id={form.id("criteria")} message={t("criteriaFailed")} label={common("retry")} onRetry={state.catalog.reload}
                /> : null}
                <Button type="submit" pending={mutation.pending} disabled={mutation.locked || !state.canWrite}>{t("send")}</Button>
                <Button variant="outlined" disabled={mutation.locked} onClick={state.close}>{t("cancel")}</Button>

            </Form> : state.canWrite ? <Button variant="outlined" disabled={!mutation.ready || state.busy} onClick={state.begin}>
                {t("write")}
            </Button> : null}

            <FormFeedback id={form.id("failure")} error={state.error} />

            {state.history.error ? <FormRetry
                id={form.id("history")} message={t("loadFailed")} label={common("retry")} onRetry={state.history.reload}
            /> : state.history.loading && !state.rows.length ? <SectionSkeleton /> : null}

            <ReviewManager
                items={state.rows} scope={`order.${order.id}`} catalogId={order.catalog?.id ?? undefined}
                onChanged={state.changed} onBusy={state.setBusy}
            />
            {!state.history.error && !state.history.loading && !state.rows.length && !state.open && !state.recovering
                ? <Text size="small" tone="muted">{t("empty")}</Text> : null}

            {state.page > 1 || state.hasNext ? <Stack direction="row" align="center" justify="between" gap={3} wrap>

                <Button variant="outlined" disabled={state.history.loading || state.busy || state.page <= 1}
                    onClick={() => state.setPage(state.page - 1)}>
                    {common("previous")}
                </Button>
                <Text size="small" tone="muted">{t("page", { page: state.page })}</Text>
                <Button variant="outlined" disabled={state.history.loading || state.busy || !state.hasNext}
                    onClick={() => state.setPage(state.page + 1)}>
                    {common("next")}
                </Button>

            </Stack> : null}

        </FormSection>

    );

}
