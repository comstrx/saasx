"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import {
    type NotificationChange, type NotificationPreferences, notificationDraft, notificationInput, notificationPreferences,
} from "@/lib/std/notification-preferences";

type Draft = { values: NotificationPreferences; dirty: boolean };

export function useNotificationPreferences () {

    const t = useTranslations("accountNotifications");
    const id = useId();
    const request = useRead("account", "preferences");
    const command = useAction("account", "settings");
    const [draft, setDraft] = useState<Draft | null>(null);
    const [success, setSuccess] = useState(false);
    const attempt = useRef<ReturnType<typeof notificationInput> | null>(null);
    const uncertain = !!command.error && command.error.kind !== "input" && ![400, 401, 403, 404, 422, 429].includes(command.error.status);
    const disabled = command.pending || uncertain || !!request.error;
    const error = useAuthError(command.error);

    useEffect(() => {

        if ( !request.data ) return;

        const values = notificationPreferences(request.data.notify_prefs);

        setDraft(( previous ) => previous?.dirty
            ? { values: notificationDraft(values, previous.values), dirty: true }
            : { values, dirty: false });

    }, [request.data]);

    useEffect(() => {

        if ( command.error ) document.getElementById(`${id}-failure`)?.focus();

    }, [command.error, id]);

    function change ( key: string, patch: NotificationChange ) {

        if ( disabled || !draft || draft.values[key]?.forced ) return;

        const topic = draft.values[key];

        if ( !topic ) return;

        command.clear();
        attempt.current = null;
        setSuccess(false);
        setDraft({ dirty: true, values: {
            ...draft.values, [key]: { ...topic, ...patch, channels: { ...topic.channels, ...patch.channels } },
        } });

    }
    async function save () {

        if ( !draft?.dirty || command.pending || request.error ) return;

        setSuccess(false);

        if ( !uncertain || !attempt.current ) attempt.current = notificationInput(draft.values);

        const result = await command.run({ notify_prefs: attempt.current });

        if ( !result ) return;

        attempt.current = null;
        setDraft({ values: draft.values, dirty: false });
        setSuccess(true);
        requestAnimationFrame(() => document.getElementById(`${id}-status`)?.focus());

    }

    return {
        t, id, request, values: draft?.values, dirty: draft?.dirty ?? false, disabled, uncertain, success,
        pending: command.pending, error, change, save,
    };

}
