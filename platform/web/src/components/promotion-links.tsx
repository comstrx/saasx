"use client";

import Badge from "@/elements/badge";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Emblem from "@/elements/emblem";
import Field from "@/elements/field";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { usePromotionLinks } from "@/hooks/use-promotion-links";
import Icon from "@/icons/icon";
import { useLocale } from "@/lib/providers/intl";
import DatePicker from "./date-picker";
import FormRetry from "./form-retry";
import Section from "./section";
import SectionSkeleton from "./section-skeleton";
import StateNotice from "./state-notice";

type Props = {
    landing: string;
    art: string;
    labels: {
        title: string; body: string; create: string; createTitle: string; createBody: string; name: string; nameHint: string;
        expires: string; save: string; cancel: string; close: string; copy: string; remove: string; live: string; expired: string;
        until: string; general: string; emptyTitle: string; emptyBody: string; failed: string; retry: string; copied: string;
        copyFailed: string; created: string; removed: string; noExpiry: string; clear: string; done: string; edit: string;
        editTitle: string; editBody: string; updated: string;
    };
};

export default function PromotionLinks ({ landing, art, labels }: Props) {

    const locale = useLocale();
    const data = usePromotionLinks(landing, {
        copied: labels.copied, copyFailed: labels.copyFailed, created: labels.created, removed: labels.removed, failed: labels.failed,
        updated: labels.updated,
    });

    if ( !data.signed ) return null;

    return (

        <Section
            title={labels.title}
            description={labels.body}
            tools={<Button size="small" onClick={() => data.begin(null)}><Icon name="plus" />{labels.create}</Button>}
        >

            {data.failed ? <FormRetry id="promotions-failure" message={labels.failed} label={labels.retry} onRetry={data.reload} />
                : data.loading ? <SectionSkeleton />
                : data.items.length ? (

                    <Stack as="ul" gap={3}>

                        {data.items.map(( item ) => (

                            <Surface key={item.id} as="li" padding={5} radius="lg">

                                <Stack direction="responsive" align="responsive" justify="between" gap={4}>

                                    <Stack direction="row" align="center" gap={4} grow>

                                        <Emblem tone="green" size="medium"><Icon name="share" /></Emblem>

                                        <Stack gap={1}>

                                            <Stack direction="row" align="center" gap={2} wrap>

                                                <Text size="value" weight="semibold" dir="auto">{item.name}</Text>

                                                <Badge tone={item.live ? "teal" : "danger"} look="flat">

                                                    {item.live ? labels.live : labels.expired}

                                                </Badge>

                                            </Stack>

                                            <Text size="small" tone="muted" dir="auto">

                                                {[item.related ?? labels.general, item.expires ? `${labels.until} ${item.expires}` : null]
                                                    .filter(Boolean).join(" · ")}

                                            </Text>

                                            {item.link ? <Text size="label" tone="muted" truncate dir="ltr">{item.link}</Text> : null}

                                        </Stack>

                                    </Stack>

                                    <Stack direction="row" gap={2} fixed>

                                        <Button variant="outlined" size="small" onClick={() => { void data.copy(item.link); }}>

                                            <Icon name="copy" />{labels.copy}

                                        </Button>

                                        <Button variant="ghost" size="small" onClick={() => data.begin(item.id)}>

                                            <Icon name="edit" />{labels.edit}

                                        </Button>

                                        <Button
                                            variant="ghost" size="small" pending={data.busy === item.id}
                                            onClick={() => { void data.drop(item.id); }}
                                        >

                                            <Icon name="trash" />{labels.remove}

                                        </Button>

                                    </Stack>

                                </Stack>

                            </Surface>

                        ))}

                    </Stack>

                ) : <StateNotice art={art} title={labels.emptyTitle} description={labels.emptyBody} compact />}

            <Dialog
                open={data.open}
                onOpenChange={data.setOpen}
                title={data.editing != null ? labels.editTitle : labels.createTitle}
                description={data.editing != null ? labels.editBody : labels.createBody}
                close={labels.close}
                footer={(

                    <>

                        <Button variant="ghost" onClick={() => data.setOpen(false)}>{labels.cancel}</Button>

                        <Button pending={data.creating} onClick={() => { void data.submit(); }}><Icon name="check" />{labels.save}</Button>

                    </>

                )}
            >

                {data.loadingCurrent ? <SectionSkeleton /> : (

                    <Stack gap={4}>

                        <Field
                            id="promotion-name" label={labels.name} hint={labels.nameHint} maxLength={64}
                            value={data.name} onChange={( event ) => data.setName(event.target.value)}
                        />

                        <DatePicker
                            id="promotion-expires"
                            locale={locale === "ar" ? "ar" : "en"}
                            label={labels.expires}
                            summary={data.expiresLabel ?? labels.noExpiry}
                            empty={!data.expiresLabel}
                            clear={labels.clear}
                            done={labels.done}
                            value={data.expires}
                            minimum={data.today}
                            mode="single"
                            open={data.picking}
                            onOpenChange={data.setPicking}
                            onChange={data.setExpires}
                        />

                    </Stack>

                )}

            </Dialog>

        </Section>

    );

}
