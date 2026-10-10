"use client";

import Accordion from "@/elements/accordion";
import Button from "@/elements/button";
import Choices from "@/elements/choices";
import Dialog from "@/elements/dialog";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useEngagementActions } from "@/hooks/use-engagement-actions";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import AttemptRecovery from "./attempt-recovery";
import FormFeedback from "./form-feedback";
import FormRetry from "./form-retry";
import MessageFields from "./message-fields";

type Props = {
    feature: "reviews" | "replies" | "comments"; id: number; scope: string; name: string;
    likes?: number | null; dislikes?: number | null; disabled?: boolean;
    onBusy?: ( busy: boolean ) => void; onChanged?: () => void;
};

export default function EngagementActions ( props: Props ) {

    const state = useEngagementActions(props);
    const { t, form, mutation } = state;
    const common = useTranslations("common");
    const options = [
        ...(state.canLike ? [{ value: "like", label: t("like"), media: <Icon name="thumbs-up" size="md" /> }] : []),
        ...(state.canDislike ? [{ value: "dislike", label: t("dislike"), media: <Icon name="thumbs-down" size="md" /> }] : []),
        ...(state.canLike ? [{ value: "none", label: t("none") }] : []),
    ];

    if ( !state.canLike && !state.canDislike && !state.canReport && !props.likes && !props.dislikes
        && !state.active && !state.error && !state.message ) return null;

    return (

        <Stack gap={2}>

            <Stack direction="row" gap={1} wrap align="center">

                {props.likes || props.dislikes ? <Text size="label" tone="muted">
                    {t("totals", { likes: props.likes ?? 0, dislikes: props.dislikes ?? 0 })}
                </Text> : null}
                {state.canLike || state.canDislike ? <Button
                    variant="ghost" disabled={state.locked} aria-label={t("reactTo", { name: props.name })}
                    onClick={() => state.begin("reaction")}
                ><Icon name="thumbs-up" size="sm" />{t("react")}</Button> : null}
                {state.canReport ? <Button
                    variant="ghost" disabled={state.locked} aria-label={t("reportBy", { name: props.name })}
                    onClick={() => state.begin("report")}
                ><Icon name="flag" size="sm" />{t("report")}</Button> : null}

            </Stack>
            <FormFeedback id={form.id("result")} message={state.message} error={!state.active ? state.error : null} />
            <Dialog
                open={!!state.active} onOpenChange={( open ) => { if ( !open ) state.close(); }}
                title={t(state.active === "report" ? "reportTitle" : "reactionTitle")}
                close={t("cancel")} dismissible={!mutation.locked}
            >

                {mutation.attempt || mutation.blocked ? <AttemptRecovery
                    title={t("recoveryTitle")} description={t(mutation.blocked ? "blocked" : "recovery")}
                    label={t("retry")} pending={mutation.pending} blocked={mutation.blocked} onRetry={state.submit}
                /> : <Form noValidate pending={mutation.pending} onSubmit={( event ) => { event.preventDefault(); void state.submit(); }}>

                    {state.active === "report" ? <>

                        <Text size="small" tone="muted">{t("reportHint")}</Text>
                        <MessageFields content={t("content")} values={form.values}
                            errors={form.errors} disabled={state.locked} id={form.id} onChange={form.change} />
                        <Accordion items={[{
                            key: "details", title: t("optionalDetails"), open: !!form.errors.reason || !!form.errors.title,
                            body: <Stack gap={4}>

                                <Field id={form.id("reason")} label={t("reason")} value={form.values.reason} maxLength={255}
                                    error={form.errors.reason} disabled={state.locked} dir="auto"
                                    onChange={( event ) => form.change({ reason: event.target.value })} />
                                <Field id={form.id("title")} label={t("title")} value={form.values.title} maxLength={255}
                                    error={form.errors.title} disabled={state.locked} dir="auto"
                                    onChange={( event ) => form.change({ title: event.target.value })} />

                            </Stack>,
                        }]} />

                    </> : <>

                        {state.reaction.loading ? <Text size="small" tone="muted" role="status">{t("loading")}</Text> : null}
                        {state.reaction.error ? <FormRetry
                            id={form.id("read")} message={t("readFailed")} label={common("retry")} onRetry={state.reaction.reload}
                        /> : null}
                        <Choices
                            label={t("reactionTitle")} value={state.choice} options={options} disabled={state.locked}
                            onValueChange={state.choose}
                        />

                    </>}
                    <Button variant="outlined" disabled={state.locked} onClick={state.close}>{t("cancel")}</Button>
                    <Button type="submit" pending={mutation.pending}
                        disabled={state.locked || state.active === "reaction" && !state.choice}>
                        {t(state.active === "report" ? "sendReport" : "saveReaction")}
                    </Button>

                </Form>}
                <FormFeedback id={form.id("failure")} error={state.error} />

            </Dialog>

        </Stack>

    );

}
