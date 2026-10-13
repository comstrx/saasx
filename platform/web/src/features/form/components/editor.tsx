"use client";

import type { FormState } from "@engine/context";
import { interpolate } from "@engine/parse";
import { row, rows } from "@engine/spec";
import type { Messages } from "@engine/translate";
import { localePath } from "@engine/translate";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Note from "@/components/note";
import SchemaForm, { type Choices, type Labels } from "@/components/schema-form";
import Status from "@/components/status";
import Titled from "@/components/titled";
import { useDirtyGuard } from "@/hooks/use-dirty-guard";
import { isQueued, useForm } from "@/hooks/use-form";
import { useLocale } from "@/hooks/use-locale";
import { usePort } from "@/hooks/use-port";
import { routing } from "@/lib/spec/config";
import type { FeatureProps } from "@/lib/spec/feature";

/**
 * Translation rows (one per locale, carrying the localized columns) folded into the record, so a
 * localized field edits every language at once.
 */
function withTexts ( record: Record<string, unknown> | undefined, translations: Record<string, unknown>[], fields: FormState<unknown>["fields"] ): Record<string, unknown> | undefined {

    if ( !translations.length ) return record;

    const localized = fields.filter(( field ) => field.kind === "localized").map(( field ) => field.name);
    const merged: Record<string, unknown> = { ...record };

    for ( const name of localized ) {

        merged[name] = Object.fromEntries(translations.flatMap(( text ) => (typeof text.locale === "string" && typeof text[name] === "string" ? [[text.locale, text[name]]] : [])));

    }

    return merged;

}
export type Options = { title: string; submit: string; saved: string; queued: string; failed: string; loading: string; offline: string; cached: string; empty: string; leave: string; next: string; labels: Labels; choices: Choices; errors: Messages };

export default function Editor ({ options, ports, route, feature }: FeatureProps<Options>) {

    const router = useRouter();
    const locale = useLocale();
    const item = usePort(ports.item, route);
    const texts = usePort(ports.texts, route);
    const form = useForm(ports.save, route, { errors: options.errors, queue: true });
    const loaded = useRef<string>("");

    useDirtyGuard(form.dirty && form.status !== "done", options.leave);
    const settled = (!ports.item || item.status === "ready") && (!ports.texts || texts.status === "ready");
    const record = settled ? withTexts(row(item.status === "ready" ? item.value : undefined), rows(texts.status === "ready" ? texts.value : undefined), form.fields) : undefined;
    const stamp = settled ? JSON.stringify(record ?? null) : "";

    useEffect(() => {

        if ( !(ports.item || ports.texts) || !settled || loaded.current === stamp ) return;

        loaded.current = stamp;
        form.load(record);

    }, [ports.item, ports.texts, settled, stamp, record, form.load]);

    useEffect(() => {

        if ( form.status !== "done" || !options.next || isQueued(form.result) ) return;

        const saved = row(form.result);
        const path = interpolate(options.next, Object.fromEntries(Object.entries(saved ?? {}).map(( [key, value] ) => [key, String(value ?? "")])));

        router.push(localePath(locale, path, routing) as Route);

    }, [form.status, form.result, options.next, locale, router]);

    const note = form.status === "done" ? { text: isQueued(form.result) ? options.queued : options.saved, tone: "success" as const } : form.status === "failed" && !Object.keys(form.errors).length ? { text: options.failed, tone: "danger" as const } : undefined;
    const waiting = !settled;
    const failing = item.status === "failed" || texts.status === "failed";
    const nothing = Boolean(ports.item) && settled && record === undefined;

    return (

        <Titled id={feature?.slug ?? "form"} title={options.title} primary={feature?.heading ?? false}>

            {item.status === "ready" && item.error !== undefined ? <Note text={options.cached} /> : null}

            {nothing ? <Note text={options.empty} /> : null}

            {waiting
                ? <Status status={failing ? "failed" : "loading"} loading={options.loading} failed={options.failed} offline={options.offline} error={item.status === "failed" ? item.error : texts.status === "failed" ? texts.error : undefined} />
                : <SchemaForm name={feature?.slug ?? "form"} form={form} labels={options.labels} choices={options.choices} submit={options.submit} note={note} />}

        </Titled>

    );

}
