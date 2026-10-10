"use client";

import Stack from "@/elements/stack";
import type { ExtraSlot } from "@/hooks/use-booking-extras";
import { useExtraFields } from "@/hooks/use-extra-fields";
import { extraKey, type extraState } from "@/lib/std/extras";
import ApplicantList from "./applicant-list";
import BookingFields from "./booking-fields";
import Questionnaire from "./questionnaire";
import SlotPicker from "./slot-picker";

type Props = {
    productId: number; state: ReturnType<typeof extraState>; today: string; errors: Record<string, string>; disabled?: boolean;
    id: ( key: string ) => string; onChange: ( values: Record<string, string> ) => void;
    reportSlot: ( id: number, state: ExtraSlot ) => void;
};

export default function ExtraFields ({ productId, state, today, errors, disabled, id, onChange, reportSlot }: Props) {

    const slots = useExtraFields(productId, state, reportSlot);
    const fields = {
        id: ( key: string ) => id(extraKey(productId, key)),
        onChange: ( patch: Partial<Record<string, string>> ) => onChange(Object.fromEntries(Object.entries(patch)
            .flatMap(( [key, value] ) => value === undefined ? [] : [[extraKey(productId, key), value]]))),
        errors: Object.fromEntries(Object.entries(errors).filter(( [key] ) => key.startsWith(extraKey(productId, "")))
            .map(( [key, value] ) => [key.slice(extraKey(productId, "").length), value])),
        disabled,
    };

    return (

        <Stack gap={5}>

            <BookingFields {...fields} values={state.values} rules={state.rules} tiers={state.tiers} today={today} />
            {state.rules.scheduled ? (

                <SlotPicker
                    {...slots} id={fields.id("slot")} value={state.values.slot} error={fields.errors.slot} disabled={disabled}
                    onChange={( value ) => fields.onChange({ slot: value })}
                />

            ) : null}
            {state.rules.named ? (

                <ApplicantList
                    {...fields} rows={state.applicants} enabled={state.applicantsEnabled}
                    required={!!state.rules.namedRequired} today={today}
                />

            ) : null}
            <Questionnaire {...fields} groups={state.questions.groups} values={state.values} />

        </Stack>

    );

}
