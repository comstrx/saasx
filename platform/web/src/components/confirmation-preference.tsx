"use client";

import FormFeedback from "@/components/form-feedback";
import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import Button from "@/elements/button";
import Form from "@/elements/form";
import Select from "@/elements/select";
import Text from "@/elements/text";
import { useConfirmationPreference } from "@/hooks/use-confirmation-preference";

export default function ConfirmationPreference ({ hasPhone }: { hasPhone: boolean }) {

    const data = useConfirmationPreference(hasPhone);
    const { t, request } = data;

    return (

        <Form pending={data.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void data.save(); }}>

            {request.loading && !request.data ? <SectionSkeleton /> : null}
            {request.error ? <FormRetry id={`${data.id}-read`} message={t("readFailed")}
                label={t("retry")} onRetry={request.reload} /> : null}
            {request.data ? <>

                <Select id={data.id} label={t("method")} hint={t("hint")} options={data.options}
                    value={data.value} disabled={data.disabled} onValueChange={( value ) => data.change(value)} />
                {!hasPhone ? <Text size="small" tone="muted">{t("phoneRequired")}</Text> : null}
                {data.value === "none" ? <Text size="small" tone="muted">{t("noneHint")}</Text> : null}
                {data.uncertain ? <Text size="small" tone="muted">{t("uncertain")}</Text> : null}

            </> : null}
            <FormFeedback id={`${data.id}-failure`} error={data.error} />
            <FormFeedback id={`${data.id}-status`} message={data.success ? t("saved") : null} />
            {request.data ? <Button type="submit" pending={data.pending} disabled={!data.dirty || !!request.error}>
                {t(data.uncertain ? "retry" : "save")}
            </Button> : null}

        </Form>

    );

}
