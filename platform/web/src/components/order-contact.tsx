"use client";

import type { Data } from "@/api/features";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import { useOrderContact } from "@/hooks/use-order-contact";
import Icon from "@/icons/icon";
import ContactFields from "./contact-fields";
import FactList from "./fact-list";
import FormFeedback from "./form-feedback";
import FormSection from "./form-section";

type Props = { order: Data<"orders", "view">; onChanged: () => void };

export default function OrderContact ({ order, onChanged }: Props) {

    const data = useOrderContact(order, onChanged);
    const { t, form } = data;

    if ( !data.facts.length && !data.editable ) return null;

    return (

        <FormSection title={t("title")} description={t(data.editable ? "description" : "locked")}>

            {data.facts.length ? <FactList compact items={data.facts} /> : <Text size="small" tone="muted">{t("empty")}</Text>}

            {data.editable ? (

                <Stack direction="row">

                    <Button variant="outlined" size="small" rounded="full" onClick={data.edit}><Icon name="edit" />{t("edit")}</Button>

                </Stack>

            ) : null}

            <Dialog
                open={data.open}
                onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t("editTitle")}
                description={t("editBody")}
                close={t("cancel")}
                size="medium"
                dismissible={!data.pending}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.pending} onClick={data.close}>{t("cancel")}</Button>

                        <Button pending={data.pending} onClick={() => { void data.save(); }}><Icon name="check" />{t("save")}</Button>

                    </>

                )}
            >

                <Stack gap={5}>

                    <ContactFields values={form.values} errors={form.errors} disabled={data.pending} id={form.id} onChange={form.change} />

                    <Textarea
                        id={form.id("notes")} label={t("notes")} rows={3} maxLength={255} dir="auto" value={form.values.notes}
                        error={form.errors.notes} disabled={data.pending} onChange={( event ) => form.change({ notes: event.target.value })}
                    />

                    <FormFeedback id={form.id("failure")} error={data.failed} />

                </Stack>

            </Dialog>

        </FormSection>

    );

}
