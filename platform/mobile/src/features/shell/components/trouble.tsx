import { router, useIsFocused } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Failure } from "@/components/states";
import type { EmblemName } from "@/elements/emblem";
import { failureShape } from "@/model/failure";
import { isolateLtr } from "@/std/bidi";
import { useLane } from "@/store/lane";

type TroubleProps = {
    reason: unknown;
    onRetry?: (() => void) | undefined;
    action?: string | undefined;
    onAction?: (() => void) | undefined;
    compact?: boolean | undefined;
};

const emblems: Record<string, EmblemName> = {
    offline: "offline",
    timeout: "clock",
    throttled: "clock",
    not_found: "lost",
    gone: "lost",
    forbidden: "lock",
    locked: "lock",
    unauthenticated: "key",
    payment_required: "card",
    conflict: "tool",
    server: "tool",
    unavailable: "tool",
};

export function Trouble ({ reason, onRetry, action, onAction, compact = false }: TroubleProps) {

    const { t } = useTranslation();
    const shape = failureShape(reason);
    const focused = useIsFocused();
    const owns = shape.offline && !compact && focused;

    useEffect(() => owns ? useLane.getState().own() : undefined, [ owns ]);

    const locked = shape.code === "unauthenticated";
    const press = onAction ?? ( locked ? () => router.push("/login") : shape.retryable ? onRetry : undefined );
    const label = locked && !onAction ? t("auth.login") : action ?? t("common.retry");

    return (
        <Failure
            emblem={emblems[shape.code] ?? "tool"}
            title={shape.title}
            note={shape.body}
            action={press ? label : undefined}
            onAction={press}
            deed={onAction ? undefined : locked ? "user" : "refresh"}
            aside={shape.reference ? t("error.reference", { id: isolateLtr(shape.reference) }) : undefined}
            compact={compact}
        />
    );

}
