"use client";

import FormFeedback from "@/components/form-feedback";
import Button from "@/elements/button";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import { useProfileName } from "@/hooks/use-profile-name";

type Props = { name: string };

export default function ProfileName ({ name }: Props) {

    const data = useProfileName(name);
    const { t } = data;

    return (

        <Form noValidate pending={data.pending} onSubmit={( event ) => { event.preventDefault(); void data.submit(); }}>

            <Field id={data.id("name")} label={t("name")} value={data.values.name} autoComplete="name" dir="auto"
                maxLength={200} disabled={data.pending} error={data.errors.name} hint={t("nameHint")}
                onChange={( event ) => data.change({ name: event.target.value })} />
            <Stack direction="row" gap={3} wrap align="center">

                <Button id={data.id("save")} type="submit" pending={data.pending} disabled={!data.dirty && !data.error}>

                    {t(data.pending ? "saving" : "saveName")}

                </Button>
                <FormFeedback id={data.id("failure")} error={data.error} message={data.success ? t("saved") : null} />

            </Stack>

        </Form>

    );

}
