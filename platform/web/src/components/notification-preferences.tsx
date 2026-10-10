"use client";

import FormFeedback from "@/components/form-feedback";
import FormRetry from "@/components/form-retry";
import NotificationTopic from "@/components/notification-topic";
import SectionSkeleton from "@/components/section-skeleton";
import Accordion from "@/elements/accordion";
import Button from "@/elements/button";
import Form from "@/elements/form";
import Text from "@/elements/text";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { notificationLabel, notificationTopics } from "@/lib/std/notification-preferences";

export default function NotificationPreferences () {

    const data = useNotificationPreferences();
    const { t, request } = data;

    const items = Object.entries(data.values ?? {}).map(( [key, topic] ) => {

        const known = notificationTopics.find(( name ) => name === key);

        return {
            key,
            title: known ? t(`topics.${known}`) : notificationLabel(key),
            meta: <Text as="span" size="label" tone="muted">{t(topic.forced ? "required" : topic.enabled ? "on" : "off")}</Text>,
            body: <NotificationTopic id={`${data.id}-${key}`} topic={topic} disabled={data.disabled}
                onChange={( patch ) => data.change(key, patch)} />,
        };

    });

    return (

        <Form pending={data.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void data.save(); }}>

            {request.loading && !data.values ? <SectionSkeleton /> : null}
            {request.error ? <FormRetry id={`${data.id}-read`} message={t("readFailed")}
                label={t("retry")} onRetry={request.reload} /> : null}
            {data.values ? <>

                <Accordion items={items} />
                {!Object.keys(data.values).length ? <Text tone="muted">{t("empty")}</Text> : null}

            </> : null}
            {data.uncertain ? <Text size="small" tone="muted">{t("uncertain")}</Text> : null}
            <FormFeedback id={`${data.id}-failure`} error={data.error} />
            <FormFeedback id={`${data.id}-status`} message={data.success ? t("saved") : null} />
            {data.values && Object.keys(data.values).length ? <Button type="submit" pending={data.pending}
                disabled={!data.dirty || !!request.error}>{t(data.uncertain ? "retry" : "save")}</Button> : null}

        </Form>

    );

}
