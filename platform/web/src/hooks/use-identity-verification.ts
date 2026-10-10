"use client";

import { useState } from "react";
import type { Data } from "@/api/features";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { fileSize } from "@/lib/std/files";
import { day } from "@/lib/std/format";

type Kind = "passport" | "national_id" | "driver_license";
type Country = Data<"account", "identityOptions">["countries"][number];
type Draft = { type: Kind; country: Country | null; name: string; number: string; front: File | null; back: File | null };
type Side = "front" | "back";

const kinds: readonly Kind[] = ["passport", "national_id", "driver_license"];
const glyphs: Record<Kind, string> = { passport: "airplane", national_id: "id-card", driver_license: "car" };
const empty: Draft = { type: "passport", country: null, name: "", number: "", front: null, back: null };
const states = ["pending", "approved", "rejected", "revoked", "expired"] as const;

export type IdentityState = (typeof states)[number] | "none";

export function useIdentityVerification () {

    const t = useTranslations("identity");
    const locale = useLocale();
    const toast = useToast();
    const record = useRead("account", "identity");
    const [open, setOpen] = useState(false);
    const options = useRead("account", "identityOptions", {}, { enabled: open });
    const submit = useAction("account", "submitIdentity");
    const [draft, setDraft] = useState<Draft>(empty);
    const [query, setQuery] = useState("");
    const [invalid, setInvalid] = useState<Partial<Record<Side, string>>>({});
    const failure = useAuthError(submit.error);
    const current = record.data && "status" in record.data ? record.data : null;
    const state: IdentityState = states.find(( value ) => value === current?.status) ?? "none";
    const rules = options.data?.constraints;
    const accept = (rules?.mime_types ?? ["jpg", "jpeg", "png", "pdf"]).map(( type ) => `.${type}`).join(",");
    const limit = rules?.max_size ?? 0;
    const needsBack = options.data?.types.find(( entry ) => entry.value === draft.type)?.documents
        .some(( document ) => document.field === "back_image" && document.required) ?? draft.type !== "passport";
    const remote = submit.error?.errors ?? {};
    const needle = query.trim().toLocaleLowerCase(locale);
    const countries = (options.data?.countries ?? [])
        .filter(( country ) => !needle || country.code?.toLowerCase() === needle
            || (country.name ?? "").toLocaleLowerCase(locale).includes(needle))
        .slice(0, 60);

    function start () {

        submit.clear();
        setDraft(empty);
        setQuery("");
        setInvalid({});
        setOpen(true);

    }
    function close () {

        if ( !submit.pending ) setOpen(false);

    }
    function change ( patch: Partial<Draft> ) {

        setDraft(( value ) => ({ ...value, ...patch }));

    }
    function pick ( side: Side, file: File | null ) {

        const extension = file?.name.split(".").pop()?.toLowerCase() ?? "";
        const problem = !file ? undefined
            : rules && !rules.mime_types.includes(extension) ? t("fileType")
            : limit && file.size > limit ? t("fileSize", { size: fileSize(limit, locale) ?? "" }) : undefined;

        setInvalid(( value ) => ({ ...value, [side]: problem }));
        change(side === "front" ? { front: file } : { back: file });

    }
    function choose ( value: string | null ) {

        change({ country: countries.find(( country ) => String(country.id) === value) ?? null });

    }
    async function send () {

        if ( submit.pending || !draft.country || !draft.front || invalid.front || invalid.back ) return;
        if ( needsBack && !draft.back ) return;

        const result = await submit.run({
            type: draft.type, geo_id: draft.country.id, number: draft.number.trim(),
            ...(draft.name.trim() ? { name: draft.name.trim() } : {}),
            front_image: draft.front,
            ...(needsBack && draft.back ? { back_image: draft.back } : {}),
        });

        if ( !result ) return;

        setOpen(false);
        toast({ title: t("sentTitle"), description: t("sentBody"), tone: "success" });
        record.reload();

    }
    function facts ( found: NonNullable<typeof current> ) {

        const kind = kinds.find(( value ) => value === found.type);
        const stamp = ( value: string ) => day(value, locale, { dateStyle: "medium" });
        const rows: { key: string; term: string; detail: string; icon: string }[] = [];

        if ( kind ) rows.push({ key: "type", term: t("document"), detail: t(`kinds.${kind}`), icon: glyphs[kind] });
        if ( found.number ) rows.push({ key: "number", term: t("number"), detail: `•••• ${found.number.slice(-4)}`, icon: "key" });
        if ( found.geo?.name ) rows.push({ key: "country", term: t("country"), detail: found.geo.name, icon: "globe" });
        if ( found.expires_at ) rows.push({ key: "expires", term: t("validUntil"), detail: stamp(found.expires_at), icon: "calendar" });

        if ( found.reviewed_at ) {

            rows.push({ key: "reviewed", term: t("reviewedOn"), detail: stamp(found.reviewed_at), icon: "calendar-check" });

        }

        return rows;

    }

    return {
        t, state, open, start, close, change, choose, pick, send, draft, query, setQuery, countries, kinds, glyphs, accept, needsBack,
        loading: record.loading && !record.data,
        failed: Boolean(record.error),
        reload: record.reload,
        optionsLoading: options.loading && !options.data,
        optionsFailed: Boolean(options.error),
        reloadOptions: options.reload,
        pending: submit.pending,
        limit: limit ? fileSize(limit, locale) ?? null : null,
        ready: Boolean(draft.country && draft.number.trim() && draft.front && (!needsBack || draft.back))
            && !invalid.front && !invalid.back,
        errors: {
            number: remote.number?.[0], country: remote.geo_id?.[0], name: remote.name?.[0],
            front: invalid.front ?? remote.front_image?.[0], back: invalid.back ?? remote.back_image?.[0],
        },
        error: Object.keys(remote).length ? null : failure,
        notes: state === "rejected" ? current?.notes ?? null : null,
        facts: current && state !== "none" ? facts(current) : [],
    };

}
