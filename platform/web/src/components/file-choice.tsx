"use client";

import Button from "@/elements/button";
import FileInput from "@/elements/file-input";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useFileChoice } from "@/hooks/use-file-choice";
import { useTranslations } from "@/lib/providers/intl";
import FormFeedback from "./form-feedback";

type Props = {
    id: string; label: string; hint?: string; error?: string; disabled?: boolean;
    value: string; onChange: ( value: string ) => void;
};

export default function FileChoice ({ id, label, hint, error, disabled, value, onChange }: Props) {

    const t = useTranslations("intake");
    const file = useFileChoice({ onChange });
    const pending = file.pending;
    const options = [{ value: "", label: t(file.files.loading ? "filesLoading" : "chooseFile") }, ...file.options];

    return (

        <Stack gap={3}>

            <Select
                id={id} label={label} hint={hint} error={error} options={options}
                value={value === "pending" ? "" : value} disabled={disabled || pending || file.files.loading}
                onValueChange={( value ) => file.choose(value)}
            />
            {file.files.error ? (

                <Stack gap={2}>

                    <Text size="small" tone="danger" role="alert">{t("filesFailed")}</Text>
                    <Button variant="outlined" onClick={file.files.reload} disabled={disabled || pending}>{t("retryFiles")}</Button>

                </Stack>

            ) : !file.files.loading && !file.options.length ? <Text size="small" tone="muted">{t("noFiles")}</Text> : null}
            <FileInput
                key={file.version} id={`${id}-upload`} label={t("newFile")} disabled={disabled || pending}
                chooseLabel={t("pickFile")} emptyLabel={t("nothingPicked")} filename={file.selected?.name}
                hint={t("fileLimit", { size: Math.floor(file.maxBytes / 1024) })}
                onChange={( event ) => file.select(event.target.files?.[0] ?? null)}
            />
            {file.selected ? (

                <Stack gap={2}>

                    <Text size="small" tone="muted">{t("uploadHint")}</Text>
                    <Stack direction="row" gap={2} wrap>

                        <Button onClick={file.send} pending={pending} disabled={disabled || file.invalid}>
                            {t(pending ? "uploading" : "upload")}
                        </Button>
                        <Button variant="ghost" onClick={() => file.choose("")} disabled={disabled || pending}>{t("cancelUpload")}</Button>

                    </Stack>

                </Stack>

            ) : null}
            {!file.selected && value === "pending" ? (

                <Button variant="outlined" onClick={() => file.choose("")} disabled={disabled || pending}>{t("cancelUpload")}</Button>

            ) : null}
            <FormFeedback id={`${id}-feedback`} error={file.error} message={value && value !== "pending" ? t("fileReady") : null} />

        </Stack>

    );

}
