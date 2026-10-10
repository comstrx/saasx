"use client";

import Button from "@/elements/button";
import Choices from "@/elements/choices";
import Dialog from "@/elements/dialog";
import Stack from "@/elements/stack";
import Textarea from "@/elements/textarea";
import Tooltip from "@/elements/tooltip";
import { type Reportable, useReport } from "@/hooks/use-report";
import Icon from "@/icons/icon";
import FormFeedback from "./form-feedback";

type Props = { feature: Reportable; id: number; name: string; look?: "icon" | "ghost" };

export default function ReportDialog ({ feature, id, name, look = "ghost" }: Props) {

    const data = useReport(feature, id);
    const { t } = data;

    return (

        <>

            {look === "icon" ? (

                <Tooltip label={t("report")}>

                    <Button variant="outlined" size="small" rounded="full" icon aria-label={t("reportTitle", { name })} onClick={data.ask}>

                        <Icon name="flag" />

                    </Button>

                </Tooltip>

            ) : (

                <Button variant="ghost" size="small" rounded="full" onClick={data.ask}><Icon name="flag" />{t("report")}</Button>

            )}

            <Dialog
                open={data.open}
                onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t("reportTitle", { name })}
                description={t("reportBody")}
                close={t("cancel")}
                dismissible={!data.reporting}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.reporting} onClick={data.close}>{t("cancel")}</Button>

                        <Button pending={data.reporting} disabled={!data.content.trim()} onClick={() => { void data.send(); }}>

                            <Icon name="flag" />{t("send")}

                        </Button>

                    </>

                )}
            >

                <Stack gap={5}>

                    <Choices label={t("reason")} labelVisible value={data.reason} options={data.reasons} onValueChange={data.pick} />

                    <Textarea
                        id={data.id} label={t("details")} hint={t("detailsHint")} rows={4} maxLength={5000} dir="auto"
                        value={data.content} disabled={data.reporting} onChange={( event ) => data.setContent(event.target.value)}
                    />

                    <FormFeedback id={`${data.id}-failure`} error={data.error} />

                </Stack>

            </Dialog>

        </>

    );

}
