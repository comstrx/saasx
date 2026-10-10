import Check from "@/elements/check";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useTranslations } from "@/lib/providers/intl";
import {
    type NotificationChange, notificationChannels, notificationLabel, type NotificationTopic as Topic,
} from "@/lib/std/notification-preferences";

type Props = { id: string; topic: Topic; disabled: boolean; onChange: ( patch: NotificationChange ) => void };

export default function NotificationTopic ({ id, topic, disabled, onChange }: Props) {

    const t = useTranslations("accountNotifications");

    const channels = Object.entries(topic.channels).map(( [key, enabled] ) => {

        const known = notificationChannels.find(( name ) => name === key);

        return { key, enabled, label: known ? t(`channels.${known}`) : notificationLabel(key) };

    });

    return (

        <Stack gap={2}>

            {topic.forced ? <Text size="small" tone="muted">{t("requiredHint")}</Text> : (
                <Check id={`${id}-enabled`} label={t("enabled")} checked={topic.enabled} disabled={disabled}
                    onChange={( enabled ) => onChange({ enabled })} />
            )}
            {channels.map(( { key: channel, enabled, label } ) => (

                <Check key={channel} id={`${id}-${channel}`}
                    label={label}
                    checked={enabled} disabled={disabled || topic.forced || !topic.enabled}
                    onChange={( value ) => onChange({ channels: { [channel]: value } })} />

            ))}
            {!Object.keys(topic.channels).length ? <Text size="small" tone="muted">{t("noChannels")}</Text> : null}

        </Stack>

    );

}
