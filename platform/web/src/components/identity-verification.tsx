"use client";

import FormFeedback from "@/components/form-feedback";
import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import Autocomplete from "@/elements/autocomplete";
import Button from "@/elements/button";
import Choices from "@/elements/choices";
import Dialog from "@/elements/dialog";
import Emblem from "@/elements/emblem";
import Facts from "@/elements/facts";
import Field from "@/elements/field";
import FileInput from "@/elements/file-input";
import Flag from "@/elements/flag";
import Form from "@/elements/form";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { type IdentityState, useIdentityVerification } from "@/hooks/use-identity-verification";
import Icon, { type IconName, isIconName } from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Tone = "teal" | "amber" | "green" | "red";

const looks: Record<IdentityState, { icon: IconName; tone: Tone; status: "neutral" | "attention" | "positive" | "negative" }> = {
    none: { icon: "id-card", tone: "teal", status: "neutral" },
    pending: { icon: "hourglass", tone: "amber", status: "attention" },
    approved: { icon: "seal", tone: "green", status: "positive" },
    rejected: { icon: "warning-circle", tone: "red", status: "negative" },
    revoked: { icon: "ban", tone: "red", status: "negative" },
    expired: { icon: "clock", tone: "amber", status: "attention" },
};

function glyph ( name: string ): IconName {

    return isIconName(name) ? name : "id-card";

}
export default function IdentityVerification () {

    const data = useIdentityVerification();
    const common = useTranslations("common");
    const { t, state, draft } = data;
    const look = looks[state];
    const again = state === "rejected" || state === "revoked" || state === "expired";

    if ( data.loading ) return <SectionSkeleton />;

    if ( data.failed ) return <FormRetry id="identity-read" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />;

    return (

        <Stack gap={5}>

            <Surface tone="track" border={false} elevation="none" radius="lg" padding={6}>

                <Stack direction="responsive" gap={5} align="start">

                    <Emblem tone={look.tone} size="large"><Icon name={look.icon} /></Emblem>

                    <Stack gap={2} grow>

                        <Stack direction="row" gap={2} align="center" wrap>

                            <Heading level={3} size="title">{t(`states.${state}.title`)}</Heading>

                            {state !== "none" ? <Status tone={look.status}>{t(`states.${state}.badge`)}</Status> : null}

                        </Stack>

                        <Text size="small" tone="muted" wrap="pretty">{t(`states.${state}.body`)}</Text>

                        {data.notes ? (

                            <Text size="small" weight="medium" wrap="pretty">{t("reason", { reason: data.notes })}</Text>

                        ) : null}

                    </Stack>

                    {state === "none" || again ? (

                        <Button variant={state === "none" ? "filled" : "outlined"} onClick={data.start}>

                            <Icon name="fingerprint" />{t(state === "none" ? "start" : "again")}

                        </Button>

                    ) : null}

                </Stack>

            </Surface>

            {data.facts.length ? (

                <Facts columns={2} items={data.facts.map(( fact ) => ({ ...fact, icon: <Icon name={glyph(fact.icon)} /> }))} />

            ) : null}

            <Dialog
                open={data.open}
                onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t("formTitle")}
                description={t("formBody")}
                close={t("cancel")}
                size="medium"
                dismissible={!data.pending}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.pending} onClick={data.close}>{t("cancel")}</Button>

                        <Button pending={data.pending} disabled={!data.ready} onClick={() => { void data.send(); }}>

                            <Icon name="upload" />{t("submit")}

                        </Button>

                    </>

                )}
            >

                {data.optionsLoading ? <SectionSkeleton /> : data.optionsFailed ? (

                    <FormRetry id="identity-options" message={common("failedBody")} label={common("retry")} onRetry={data.reloadOptions} />

                ) : (

                    <Form pending={data.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void data.send(); }}>

                        <Choices
                            label={t("document")}
                            labelVisible
                            look="pick"
                            columns={3}
                            value={draft.type}
                            disabled={data.pending}
                            options={data.kinds.map(( kind ) => ({
                                value: kind, label: t(`kinds.${kind}`), media: <Icon name={glyph(data.glyphs[kind])} size="lg" />,
                            }))}
                            onValueChange={( value ) => data.change({ type: data.kinds.find(( kind ) => kind === value) ?? "passport" })}
                        />

                        <Autocomplete
                            id="identity-country"
                            look="field"
                            label={t("country")}
                            placeholder={t("countryPlaceholder")}
                            clear={t("clear")}
                            query={data.query}
                            value={draft.country ? { value: String(draft.country.id), label: draft.country.name ?? "" } : null}
                            options={data.countries.map(( country ) => ({
                                value: String(country.id),
                                label: country.name ?? "",
                                leading: country.code && !country.code.startsWith("X") ? <Flag code={country.code} /> : undefined,
                            }))}
                            status={data.countries.length ? null : t("countryEmpty")}
                            onQueryChange={data.setQuery}
                            onSelect={data.choose}
                        />

                        <Grid columns={2} mobileColumns={1} gap={4}>

                            <Field
                                id="identity-number"
                                label={t("number")}
                                autoComplete="off"
                                maxLength={100}
                                dir="ltr"
                                value={draft.number}
                                error={data.errors.number}
                                disabled={data.pending}
                                onChange={( event ) => data.change({ number: event.target.value })}
                            />

                            <Field
                                id="identity-name"
                                label={t("name")}
                                optional={t("optional")}
                                autoComplete="name"
                                maxLength={200}
                                value={draft.name}
                                error={data.errors.name}
                                disabled={data.pending}
                                onChange={( event ) => data.change({ name: event.target.value })}
                            />

                        </Grid>

                        <Grid columns={data.needsBack ? 2 : 1} mobileColumns={1} gap={4}>

                            <FileInput
                                id="identity-front"
                                label={t("front")}
                                accept={data.accept}
                                chooseLabel={t("choose")}
                                emptyLabel={t("nothingChosen")}
                                filename={draft.front?.name}
                                hint={data.limit ? t("fileHint", { size: data.limit }) : undefined}
                                error={data.errors.front}
                                disabled={data.pending}
                                onChange={( event ) => data.pick("front", event.target.files?.[0] ?? null)}
                            />

                            {data.needsBack ? (

                                <FileInput
                                    id="identity-back"
                                    label={t("back")}
                                    accept={data.accept}
                                    chooseLabel={t("choose")}
                                    emptyLabel={t("nothingChosen")}
                                    filename={draft.back?.name}
                                    hint={data.limit ? t("fileHint", { size: data.limit }) : undefined}
                                    error={data.errors.back}
                                    disabled={data.pending}
                                    onChange={( event ) => data.pick("back", event.target.files?.[0] ?? null)}
                                />

                            ) : null}

                        </Grid>

                        <FormFeedback id="identity-failure" error={data.error} />

                    </Form>

                )}

            </Dialog>

        </Stack>

    );

}
