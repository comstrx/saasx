"use client";

import FormFeedback from "@/components/form-feedback";
import ReviewFields from "@/components/review-fields";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Divider from "@/elements/divider";
import Stack from "@/elements/stack";
import Stars from "@/elements/stars";
import Text from "@/elements/text";
import { useSubscriptionReview } from "@/hooks/use-subscription-review";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = { subscriptionId: number | null; name: string; onClose: () => void; onDone: () => void };

export default function SubscriptionReview ({ subscriptionId, name, onClose, onDone }: Props) {

    const t = useTranslations("subscriptions");
    const data = useSubscriptionReview(subscriptionId, onDone);

    return (

        <Dialog
            open={subscriptionId != null}
            onOpenChange={( open ) => { if ( !open && !data.pending ) onClose(); }}
            title={t("reviewTitle", { plan: name })}
            description={t("reviewBody")}
            close={t("close")}
            size="medium"
            dismissible={!data.pending}
            footer={(

                <>

                    <Button variant="ghost" disabled={data.pending} onClick={onClose}>{t("close")}</Button>

                    <Button pending={data.pending} onClick={() => { void data.submit(); }}><Icon name="star" />{t("submitReview")}</Button>

                </>

            )}
        >

            <Stack gap={5}>

                {data.past.length ? (

                    <Stack gap={4}>

                        <Text size="small" weight="semibold">{t("pastReviews")}</Text>

                        {data.past.map(( entry ) => (

                            <Stack key={entry.id} gap={1}>

                                <Stack direction="row" align="center" gap={2} wrap>

                                    <Stars value={entry.rating} label={t("rated", { rating: entry.rating })} />

                                    {entry.date ? <Text size="label" tone="muted">{entry.date}</Text> : null}

                                </Stack>

                                {entry.title ? <Text size="small" weight="semibold" dir="auto">{entry.title}</Text> : null}

                                {entry.content ? <Text size="small" tone="muted" dir="auto" wrap="pretty">{entry.content}</Text> : null}

                            </Stack>

                        ))}

                        <Divider />

                    </Stack>

                ) : null}

                <ReviewFields
                    values={data.values}
                    errors={data.errors}
                    aspects={[]}
                    disabled={data.pending}
                    id={( key ) => `subscription-review-${key}`}
                    onChange={data.change}
                />

                <FormFeedback id="subscription-review-failure" error={data.error} />

            </Stack>

        </Dialog>

    );

}
