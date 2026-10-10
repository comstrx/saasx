"use client";

import { useEffect, useRef, useState } from "react";
import { useAction, useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { useSite } from "@/lib/site/context";
import { limitsOf } from "@/lib/std/form";
import { uuid } from "@/lib/std/security";

type Options = { onChange: ( value: string ) => void };

export function useFileChoice ( { onChange }: Options ) {

    const t = useTranslations("intake");
    const changed = useRef(onChange);

    useEffect(() => { changed.current = onChange; }, [onChange]);
    const { policy } = useSite();
    const files = useRead("account", "files");
    const upload = useAction("account", "uploadFiles");
    const [selected, setSelected] = useState<File | null>(null);
    const [failure, setFailure] = useState<string | null>(null);
    const [version, setVersion] = useState(0);
    const attempt = useRef<string | null>(null);
    const userPolicy = policy.upload_policies.user ?? policy.upload_policies.default;
    const limits = limitsOf(policy.upload_max_bytes, policy.request_max_bytes, policy.upload_max_count);
    const maxBytes = Math.min(limits.fileBytes, userPolicy?.max_bytes ?? limits.fileBytes);
    const owned = [...(upload.result?.resource.files ?? []), ...(files.data?.files ?? [])];
    const unique = [...new Map(owned.filter(( file ) => file.id).map(( file ) => [file.id, file])).values()];
    const options = unique.map(( file ) => ({ value: String(file.id), label: file.name || t("fileName", { id: file.id ?? 0 }) }));
    const remoteError = upload.error ? Object.values(upload.error.errors).flat()[0] || t("uploadFailed") : null;

    function choose ( value: string ) {

        if ( upload.pending ) return;

        setSelected(null);
        setFailure(null);
        setVersion(( current ) => current + 1);
        upload.clear();
        attempt.current = null;
        changed.current(value);

    }
    function select ( file: File | null ) {

        if ( upload.pending ) return;

        setSelected(file);
        upload.clear();
        attempt.current = null;
        setFailure(null);
        changed.current(file ? "pending" : "");

        if ( !file ) return;

        if ( file.size > maxBytes ) setFailure(t("fileSize", { size: Math.floor(maxBytes / 1024) }));
        else if ( policy.blocked_extensions.includes(file.name.split(".").pop()?.toLowerCase() ?? "") ) {

            setFailure(t("fileType"));

        }

    }
    async function send () {

        if ( !selected || failure || upload.pending ) return;

        if ( !attempt.current || upload.error && [400, 401, 403, 404, 422].includes(upload.error.status) ) attempt.current = uuid();

        const reply = await upload.run({ files: [selected] }, { idempotencyKey: attempt.current });
        const id = reply?.resource.files.find(( file ) => file.id)?.id;

        if ( id ) {

            attempt.current = null;
            setSelected(null);
            setVersion(( current ) => current + 1);
            changed.current(String(id));

        }
        else if ( reply ) setFailure(t("uploadFailed"));

    }

    return {
        files, options, selected, version, maxBytes, pending: upload.pending, invalid: !!failure,
        error: failure || remoteError, choose, select, send,
    };

}
