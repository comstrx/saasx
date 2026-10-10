"use client";

import { useEffect, useId, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";

const ways = ["email", "sms", "whatsapp", "none"] as const;
type Way = typeof ways[number];

export function useConfirmationPreference ( hasPhone: boolean ) {

    const t = useTranslations("accountConfirmation");
    const id = useId();
    const request = useRead("account", "preferences");
    const command = useAction("account", "settings");
    const [chosen, setChosen] = useState<Way | null>(null);
    const [saved, setSaved] = useState("");
    const [success, setSuccess] = useState(false);
    const value = chosen ?? request.data?.confirmation_way ?? "";
    const uncertain = !!command.error && command.error.kind !== "input" && ![400, 401, 403, 404, 422, 429].includes(command.error.status);
    const error = useAuthError(command.error);

    useEffect(() => {

        if ( command.error ) document.getElementById(`${id}-failure`)?.focus();

    }, [command.error, id]);

    function change ( next: string ) {

        if ( command.pending || uncertain || !ways.some(( way ) => way === next) ) return;

        setChosen(next as Way);
        setSuccess(false);
        command.clear();

    }
    async function save () {

        if ( !chosen || command.pending || request.error ) return;
        if ( !hasPhone && (chosen === "sms" || chosen === "whatsapp") ) return;

        setSuccess(false);

        const result = await command.run({ confirmation_way: chosen });

        if ( !result ) return;

        setSaved(chosen);
        setSuccess(true);
        requestAnimationFrame(() => document.getElementById(`${id}-status`)?.focus());

    }

    return {
        t, id, request, value, error, success, uncertain, pending: command.pending, change, save,
        dirty: !!chosen && chosen !== (saved || request.data?.confirmation_way),
        disabled: command.pending || uncertain || !!request.error,
        options: [
            ...(!ways.some(( way ) => way === value) ? [{ value, label: t("choose"), disabled: true }] : []),
            ...ways.map(( way ) => ({ value: way, label: t(way), disabled: !hasPhone && (way === "sms" || way === "whatsapp") })),
        ],
    };

}
