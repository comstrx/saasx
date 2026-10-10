"use client";

import FormFeedback from "@/components/form-feedback";
import Button from "@/elements/button";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import { useDisplayPreferences } from "@/hooks/use-display-preferences";

export default function DisplayPreferences () {

    const { t, groups } = useDisplayPreferences();

    return (

        <Stack gap={6}>

            {groups.map(( item ) => (

                <Stack key={item.key} gap={2}>

                    <Select id={item.id} label={t(item.key)} hint={t(`${item.key}Hint`)}
                        value={item.value} options={item.options} disabled={item.pending}
                        onValueChange={( value ) => item.change(value)} />
                    <FormFeedback id={`${item.id}-status`} error={item.failed ? t("syncFailed") : null}
                        message={item.pending ? t("saving") : null} />
                    {item.failed ? <Stack direction="row">
                        <Button variant="outlined" onClick={item.retry}>{t("retrySync")}</Button>
                    </Stack> : null}

                </Stack>

            ))}

        </Stack>

    );

}
