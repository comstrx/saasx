"use client";

import Button from "@/elements/button";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Link from "@/elements/link";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import { type ListValues, useListControls } from "@/hooks/use-list-controls";
import Icon from "@/icons/icon";

type Option = { value: string; label: string };
type Props = {
    values: ListValues; statuses: readonly Option[]; sorts: readonly Option[]; pending?: boolean;
    labels: { query: string; status: string; sort: string; apply: string; clear: string };
    clear?: string; onApply: ( values: ListValues ) => void;
};

export default function ListControls ({ values, statuses, sorts, pending, labels, clear, onApply }: Props) {

    const form = useListControls(values);

    return (

        <Surface padding={3} radius="lg">

            <Form pending={pending} onSubmit={( event ) => { event.preventDefault(); onApply(form.draft); }}>

                <Stack direction="responsive" gap={3} align="responsive">

                    <Stack grow>

                        <Field
                            id={form.id("query")} label={labels.query} labelHidden type="search" maxLength={200}
                            placeholder={labels.query} start={<Icon name="search" tone="muted" />}
                            value={form.draft.query} onChange={( event ) => form.change({ query: event.target.value })}
                        />

                    </Stack>

                    <Select
                        id={form.id("status")} label={labels.status} labelHidden options={statuses} value={form.draft.status}
                        onValueChange={( value ) => form.change({ status: value })}
                    />

                    <Select
                        id={form.id("sort")} label={labels.sort} labelHidden options={sorts} value={form.draft.sort}
                        onValueChange={( value ) => form.change({ sort: value })}
                    />

                    <Stack direction="row" align="center" gap={2}>

                        <Button type="submit" disabled={pending}><Icon name="funnel" />{labels.apply}</Button>

                        {clear ? <Link href={clear} variant="subtle">{labels.clear}</Link> : null}

                    </Stack>

                </Stack>

            </Form>

        </Surface>

    );

}
