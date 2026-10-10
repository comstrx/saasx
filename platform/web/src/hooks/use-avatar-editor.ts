"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { useSite } from "@/lib/site/context";
import { fileSize } from "@/lib/std/files";
import { limitsOf } from "@/lib/std/form";
import { profileImageError, profileImageTypes } from "@/lib/std/profile-image";
import { uuid } from "@/lib/std/security";

type Options = { image?: string | null; allowed: boolean };

export function useAvatarEditor ( { image, allowed }: Options ) {

    const t = useTranslations("accountImage");
    const locale = useLocale();
    const id = useId();
    const { policy } = useSite();
    const upload = useAction("account", "image");
    const removal = useAction("account", "removeImage");
    const [selected, setSelected] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null | undefined>(image);
    const [version, setVersion] = useState(0);
    const [invalid, setInvalid] = useState<string | null>(null);
    const [notice, setNotice] = useState("");
    const [confirm, setConfirm] = useState(false);
    const attempt = useRef<string | null>(null);
    const held = policy.upload_policies.user ?? policy.upload_policies.default;
    const limits = limitsOf(policy.upload_max_bytes, policy.request_max_bytes, policy.upload_max_count);
    const maxBytes = Math.min(limits.fileBytes, held?.max_bytes ?? limits.fileBytes);
    const size = fileSize(maxBytes, locale) ?? "";
    const failure = upload.error ?? removal.error;
    const pending = upload.pending || removal.pending;
    const uncertain = !!failure && failure.kind !== "input" && ![400, 401, 403, 404, 422, 429].includes(failure.status);
    const locked = !allowed || pending || uncertain;
    const error = useAuthError(failure);

    useEffect(() => { setSaved(image); }, [image]);

    useEffect(() => {

        if ( !selected || invalid ) {

            setPreview(null);
            return;

        }

        const url = URL.createObjectURL(selected);

        setPreview(url);

        return () => URL.revokeObjectURL(url);

    }, [selected, invalid]);

    useEffect(() => {

        const target = invalid ? "file" : confirm ? "remove-failure" : "failure";

        if ( failure || invalid ) document.getElementById(`${id}-${target}`)?.focus();

    }, [failure, invalid, id, confirm]);

    function clear () {

        setSelected(null);
        setInvalid(null);
        setVersion(( value ) => value + 1);
        upload.clear();
        removal.clear();
        attempt.current = null;

    }
    function select ( file: File | null ) {

        if ( locked ) return;

        clear();
        setNotice("");
        setSelected(file);

        const problem = file ? profileImageError(file, {
            maxBytes, blocked: policy.blocked_extensions,
        }) : null;

        if ( problem ) setInvalid(t(problem, { size }));

    }
    function finish ( message: string ) {

        clear();
        setConfirm(false);
        setNotice(message);
        requestAnimationFrame(() => document.getElementById(`${id}-status`)?.focus());

    }
    async function send () {

        if ( !allowed || pending || invalid || !selected ) return;

        if ( !attempt.current || upload.error && !uncertain ) attempt.current = uuid();

        const result = await upload.run({ image: selected }, { idempotencyKey: attempt.current });

        if ( !result ) return;

        setSaved(result.resource.image);
        finish(t("saved"));

    }
    async function remove () {

        if ( !allowed || pending ) return;

        const result = await removal.run({});

        if ( !result ) return;

        setSaved(null);
        finish(t("removed"));

    }

    return {
        t, id, selected, preview, version, notice, pending, uncertain, locked, invalid, confirm, maxBytes,
        image: saved === undefined ? image : saved, accept: profileImageTypes.join(","), hint: t("hint", { size }),
        error: invalid || error, select, send, remove,
        cancel: () => {

            if ( locked ) return;

            clear();
            setNotice("");

        },
        ask: () => {

            if ( locked ) return;

            setNotice("");
            removal.clear();
            setConfirm(true);

        },
        close: () => { if ( !pending && !uncertain ) setConfirm(false); },
    };

}
