"use client";

import { useEffect, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";

const blank = { name: "", email: "", phone: "", domain: "" };

export function useWorkspaceEditor ( tenantId: number | null, onDone: () => void ) {

    const t = useTranslations("workspaces");
    const toast = useToast();
    const view = useRead("tenants", "view", { tenantId: tenantId ?? 0 }, { enabled: tenantId != null });
    const update = useAction("tenants", "update");
    const [values, setValues] = useState(blank);
    const failure = useAuthError(update.error);
    const remote = update.error?.errors ?? {};
    const row = view.data;

    useEffect(() => {

        if ( row ) setValues({ name: row.name ?? "", email: row.email ?? "", phone: row.phone ?? "", domain: "" });

    }, [row]);

    async function save () {

        if ( !tenantId || update.pending || values.name.trim().length < 2 ) return;

        const result = await update.run({
            tenantId, name: values.name.trim(),
            ...(values.email.trim() ? { email: values.email.trim() } : {}),
            ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
            ...(values.domain.trim() ? { domain_name: values.domain.trim() } : {}),
        });

        if ( !result ) return;

        toast({ title: t("saved"), tone: "success" });
        onDone();

    }

    return {
        values, save, change: ( patch: Partial<typeof blank> ) => setValues(( current ) => ({ ...current, ...patch })),
        host: row?.host ?? null,
        loading: view.loading && !row,
        pending: update.pending,
        errors: {
            name: remote.name?.[0] ?? (values.name.trim().length < 2 && values.name ? t("nameShort") : undefined),
            email: remote.email?.[0], phone: remote.phone?.[0], domain: remote.domain_name?.[0] ?? remote.domains?.[0],
        },
        error: Object.keys(remote).length ? null : failure,
    };

}
