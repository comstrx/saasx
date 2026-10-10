"use client";

import FormFeedback from "@/components/form-feedback";
import ShareButton from "@/components/share-button";
import Button from "@/elements/button";
import Choices from "@/elements/choices";
import Dialog from "@/elements/dialog";
import Stack from "@/elements/stack";
import Textarea from "@/elements/textarea";
import Tooltip from "@/elements/tooltip";
import { type Engaging, useEntityActions } from "@/hooks/use-entity-actions";
import Icon from "@/icons/icon";

type Verb = "react" | "save" | "share" | "report";
type Props = {
    feature: Engaging; id: number; name: string; saved?: boolean; login: string; verbs?: readonly Verb[]; compact?: boolean;
};

export default function EntityActions ({
    feature, id, name, saved = false, login, verbs = ["react", "save", "share", "report"], compact = false,
}: Props) {

    const data = useEntityActions(feature, id, saved, login);
    const { t } = data;

    return (

        <Stack direction="row" align="center" gap={2} wrap>

            {verbs.includes("react") ? (

                <>

                    <Tooltip label={t("like")}>

                        <Button
                            variant={data.reaction === "like" ? "subtle" : "outlined"} size="small" rounded="full" icon
                            aria-label={t("like")} aria-pressed={data.reaction === "like"} disabled={data.pending}
                            onClick={() => { void data.react("like"); }}
                        >

                            <Icon name="thumbs-up" weight={data.reaction === "like" ? "fill" : "regular"} />

                        </Button>

                    </Tooltip>

                    <Tooltip label={t("dislike")}>

                        <Button
                            variant={data.reaction === "dislike" ? "subtle" : "outlined"} size="small" rounded="full" icon
                            aria-label={t("dislike")} aria-pressed={data.reaction === "dislike"} disabled={data.pending}
                            onClick={() => { void data.react("dislike"); }}
                        >

                            <Icon name="thumbs-down" weight={data.reaction === "dislike" ? "fill" : "regular"} />

                        </Button>

                    </Tooltip>

                </>

            ) : null}

            {verbs.includes("save") ? (

                <Button
                    variant="outlined" size="small" rounded="full" aria-pressed={data.favorite} disabled={data.pending}
                    onClick={() => { void data.toggle(); }}
                >

                    <Icon name="heart" weight={data.favorite ? "fill" : "regular"} tone={data.favorite ? "accent" : "inherit"} />

                    {t(data.favorite ? "saved" : "save")}

                </Button>

            ) : null}

            {verbs.includes("share") ? (

                <ShareButton title={name} labels={{ label: t("share"), copied: t("copied"), failed: t("shareFailed") }} />

            ) : null}

            {verbs.includes("report") ? compact ? (

                <Tooltip label={t("report")}>

                    <Button variant="outlined" size="small" rounded="full" icon aria-label={t("reportTitle", { name })} onClick={data.ask}>

                        <Icon name="flag" />

                    </Button>

                </Tooltip>

            ) : (

                <Button variant="ghost" size="small" rounded="full" onClick={data.ask}><Icon name="flag" />{t("report")}</Button>

            ) : null}

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
                        id={`report-${feature}-${id}`} label={t("details")} hint={t("detailsHint")} rows={4} maxLength={5000} dir="auto"
                        value={data.content} disabled={data.reporting} onChange={( event ) => data.setContent(event.target.value)}
                    />

                    <FormFeedback id={`report-${feature}-${id}-failure`} error={data.error} />

                </Stack>

            </Dialog>

        </Stack>

    );

}
