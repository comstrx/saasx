"use client";

import type { Data } from "@/api/features";
import Button from "@/elements/button";
import Form from "@/elements/form";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import { useAmendmentForm } from "@/hooks/use-amendment-form";
import type { useOrderMutation } from "@/hooks/use-order-mutation";
import ApplicantList from "./applicant-list";
import BookingFields from "./booking-fields";
import FormFeedback from "./form-feedback";
import Questionnaire from "./questionnaire";
import SlotPicker from "./slot-picker";

type Props = {
    order: Data<"orders", "view">; product: Data<"products", "order">["product"];
    mutation: ReturnType<typeof useOrderMutation>; onDone: () => void; onCancel: () => void;
};

export default function AmendmentForm ({ order, product, mutation, onDone, onCancel }: Props) {

    const state = useAmendmentForm(order, product, mutation, onDone);
    const { t, form, rules } = state;

    return (

        <Form noValidate pending={mutation.pending} onSubmit={( event ) => { event.preventDefault(); void state.submit(); }}>

            <Text size="small" tone="muted">{t("proposalHint")}</Text>
            <BookingFields
                values={form.values} rules={rules} tiers={[]} errors={form.errors} today={state.today}
                disabled={mutation.locked} id={form.id} onChange={form.change}
            />
            {state.held ? <Stack gap={3}>

                <Text size="small">{t("held")}</Text>
                <Button variant="outlined" disabled={mutation.locked} onClick={() => form.change({ slot: "" })}>
                    {t("changeTime")}
                </Button>

            </Stack> : <SlotPicker
                {...state.slots} id={form.id("slot")} value={form.values.slot} error={form.errors.slot}
                disabled={mutation.locked} onChange={( value ) => form.change({ slot: value })}
            />}
            {state.canRestoreTime ? <Button variant="outlined" onClick={state.restoreTime} disabled={mutation.locked}>
                {t("restoreTime")}
            </Button> : null}
            {rules.party ? <Select
                id={form.id("pets")} label={t("fields.pets")} value={form.values.pets ?? ""}
                options={[{ value: "false", label: t("fields.no") }, { value: "true", label: t("fields.yes") }]}
                disabled={mutation.locked} onValueChange={( value ) => form.change({ pets: value })}
            /> : null}
            {rules.named ? <ApplicantList
                rows={state.applicants} required={!!rules.namedRequired} enabled={state.applicantsEnabled}
                disabled={mutation.locked} today={state.today} errors={form.errors} id={form.id} onChange={form.change}
            /> : null}
            <Questionnaire
                groups={state.questions.groups} values={form.values} errors={form.errors}
                id={form.id} onChange={form.change} disabled={mutation.locked}
            />
            <Textarea
                id={form.id("notes")} label={t("notes")} value={form.values.notes} maxLength={3000} rows={3}
                disabled={mutation.locked} error={form.errors.notes} dir="auto"
                onChange={( event ) => form.change({ notes: event.target.value })}
            />
            <FormFeedback id={form.id("failure")} error={state.error} />
            <Button
                type="submit" pending={mutation.pending} disabled={mutation.locked || !order.can_amend || state.countConflict}
            >{t("send")}</Button>
            <Button variant="outlined" disabled={mutation.locked} onClick={onCancel}>{t("back")}</Button>

        </Form>

    );

}
