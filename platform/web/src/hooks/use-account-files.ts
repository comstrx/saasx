"use client";

import { useRef, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { useSite } from "@/lib/site/context";
import { fileSize } from "@/lib/std/files";
import { limitsOf } from "@/lib/std/form";
import { uuid } from "@/lib/std/security";
import { webUrl } from "@/lib/std/url";

type Removal = { id: number; name: string };

const most = 8;

function glyph ( name: string, type: string ): string {

    const extension = name.split(".").pop()?.toLowerCase() ?? "";

    if ( type.includes("pdf") || extension === "pdf" ) return "file-pdf";
    if ( type.startsWith("image") || ["jpg", "jpeg", "png", "webp", "gif", "heic"].includes(extension) ) return "file-image";

    return "file";

}
export function useAccountFiles () {

    const t = useTranslations("accountFiles");
    const locale = useLocale();
    const toast = useToast();
    const { policy } = useSite();
    const files = useRead("account", "files");
    const upload = useAction("account", "uploadFiles");
    const remove = useAction("account", "deleteFiles");
    const [chosen, setChosen] = useState<File[]>([]);
    const [problem, setProblem] = useState<string | null>(null);
    const [version, setVersion] = useState(0);
    const [removal, setRemoval] = useState<Removal | null>(null);
    const attempt = useRef<string | null>(null);
    const owner = policy.upload_policies.user ?? policy.upload_policies.default;
    const limits = limitsOf(policy.upload_max_bytes, policy.request_max_bytes, policy.upload_max_count);
    const maxBytes = Math.min(limits.fileBytes, owner?.max_bytes ?? limits.fileBytes);
    const count = Math.min(most, limits.count || most);
    const uploadError = useAuthError(upload.error);
    const removeError = useAuthError(remove.error);

    function select ( list: FileList | null ) {

        if ( upload.pending ) return;

        const picked = Array.from(list ?? []);
        const blocked = picked.find(( file ) => policy.blocked_extensions.includes(file.name.split(".").pop()?.toLowerCase() ?? ""));
        const heavy = picked.find(( file ) => file.size > maxBytes);

        upload.clear();
        attempt.current = null;
        setChosen(picked);
        setProblem(picked.length > count ? t("tooMany", { count })
            : blocked ? t("blocked", { name: blocked.name })
            : heavy ? t("tooLarge", { name: heavy.name, size: fileSize(maxBytes, locale) ?? "" }) : null);

    }
    function reset () {

        setChosen([]);
        setProblem(null);
        setVersion(( value ) => value + 1);

    }
    async function send () {

        if ( !chosen.length || problem || upload.pending ) return;
        if ( !attempt.current ) attempt.current = uuid();

        const result = await upload.run({ files: chosen }, { idempotencyKey: attempt.current });

        if ( !result ) return;

        attempt.current = null;
        toast({ title: t("uploaded", { count: chosen.length }), tone: "success" });
        reset();
        files.reload();

    }
    function ask ( entry: Removal ) {

        if ( remove.pending ) return;

        remove.clear();
        setRemoval(entry);

    }
    function close () {

        if ( !remove.pending ) setRemoval(null);

    }
    async function erase () {

        if ( !removal || remove.pending ) return;

        const result = await remove.run({ ids: [removal.id] });

        if ( !result ) return;

        toast({ title: t("deleted", { name: removal.name }), tone: "success" });
        setRemoval(null);
        files.reload();

    }

    return {
        t, select, reset, send, ask, close, erase, removal, version, count,
        chosen: chosen.length,
        picked: chosen.length === 1 ? chosen[0]?.name : chosen.length ? t("chosen", { count: chosen.length }) : undefined,
        limit: fileSize(maxBytes, locale) ?? null,
        loading: files.loading && !files.data,
        failed: Boolean(files.error),
        reload: files.reload,
        uploading: upload.pending,
        removing: remove.pending,
        problem: problem ?? uploadError,
        removeError,
        items: (files.data?.files ?? []).flatMap(( file ) => file.id ? [{
            id: file.id,
            name: file.name || t("unnamed", { id: file.id }),
            href: webUrl(file.url) ?? null,
            size: fileSize(file.bytes, locale) ?? null,
            icon: glyph(file.name ?? "", file.type ?? ""),
        }] : []),
    };

}
