"use client";

import { useEffect, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";

type Values = { title: string; content: string };

export function useTicketEditor ( ticketId: number, initial: Values | null, onDone: () => void ) {

    const t = useTranslations("support");
    const toast = useToast();
    const update = useAction("tickets", "update");
    const [values, setValues] = useState<Values>({ title: "", content: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const failure = useAuthError(update.error);

    useEffect(() => {

        if ( initial ) {

            setValues(initial);
            setErrors({});
            update.clear();

        }

    }, [initial, update.clear]);

    async function save () {

        const found = {
            ...(values.title.trim().length < 2 ? { title: t("titleShort") } : {}),
            ...(values.content.trim().length < 5 ? { content: t("contentShort") } : {}),
        };

        setErrors(found);

        if ( Object.keys(found).length || update.pending ) return;

        const result = await update.run({ ticketId, title: values.title.trim(), content: values.content.trim() });

        if ( !result ) return;

        toast({ title: t("updated"), tone: "success" });
        onDone();

    }

    return {
        values, errors, save, pending: update.pending, error: failure,
        change: ( patch: Partial<Values> ) => setValues(( current ) => ({ ...current, ...patch })),
    };

}
