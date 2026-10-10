"use client";

import FormFeedback from "@/components/form-feedback";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import FileInput from "@/elements/file-input";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useAvatarEditor } from "@/hooks/use-avatar-editor";

type Props = { image?: string | null; name: string; allowed: boolean };

export default function AvatarEditor ({ image, name, allowed }: Props) {

    const data = useAvatarEditor({ image, allowed });
    const { t } = data;
    const initials = name.trim().split(/\s+/).slice(0, 2).map(( word ) => word[0] ?? "").join("").toUpperCase();

    return (

        <Stack gap={4}>

            <Stack direction="row" gap={4} align="center">

                <Portrait src={data.preview || data.image} alt={t(data.preview ? "preview" : "current")} initials={initials} size="large" />
                <Text size="small" tone="muted">{t(data.selected ? "previewHint" : "description")}</Text>

            </Stack>
            {allowed ? <>

                <FileInput key={data.version} id={`${data.id}-file`} label={t("choose")}
                    chooseLabel={t("browse")} emptyLabel={t("noFile")} filename={data.selected?.name} hint={data.hint}
                    accept={data.accept} disabled={data.locked} error={data.invalid ?? undefined}
                    onChange={( event ) => data.select(event.target.files?.[0] ?? null)} />
                <Stack direction="row" gap={2} wrap>

                    {data.selected ? <>

                        <Button pending={data.pending} disabled={!!data.invalid} onClick={() => { void data.send(); }}>
                            {t(data.uncertain ? "retry" : "save")}
                        </Button>
                        <Button variant="ghost" disabled={data.locked} onClick={data.cancel}>{t("discard")}</Button>

                    </> : data.image ? <Button variant="outlined" disabled={data.locked} onClick={data.ask}>{t("remove")}</Button> : null}

                </Stack>

            </> : <Text size="small" tone="muted">{t("denied")}</Text>}
            {data.uncertain ? <Text size="small" tone="muted">{t("uncertain")}</Text> : null}
            <FormFeedback id={`${data.id}-failure`} error={data.confirm || data.invalid ? null : data.error} />
            <FormFeedback id={`${data.id}-status`} message={data.notice} />
            <Dialog open={data.confirm} onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t("removeTitle")} close={t("cancel")}
                dismissible={!data.pending && !data.uncertain}>

                <Stack gap={4}>

                    <Text tone="muted">{t("removeBody")}</Text>
                    <FormFeedback id={`${data.id}-remove-failure`} error={data.error} />
                    <Button variant="outlined" disabled={data.pending || data.uncertain} onClick={data.close}>{t("cancel")}</Button>
                    <Button pending={data.pending} disabled={!allowed} onClick={() => { void data.remove(); }}>
                        {t(data.uncertain ? "retry" : "remove")}
                    </Button>

                </Stack>

            </Dialog>

        </Stack>

    );

}
