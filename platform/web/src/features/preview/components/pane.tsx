"use client";

import { isFailure } from "@engine/error";
import { interpolate } from "@engine/parse";
import { field, row } from "@engine/spec";
import { failureMessages, formatDate, formatMoney, localePath, type Messages } from "@engine/translate";
import DetailActions, { type DetailAction } from "@/components/detail-actions";
import DetailCard from "@/components/detail-card";
import Note from "@/components/note";
import Status from "@/components/status";
import Titled from "@/components/titled";
import { useLocale } from "@/hooks/use-locale";
import { usePort } from "@/hooks/use-port";
import { useWrite } from "@/hooks/use-write";
import { routing } from "@/lib/spec/config";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; pick: string; from: string; missing: string; loading: string; failed: string; offline: string; cached: string; edit: string; editLabel: string; remove: string; restore: string; removed: string; restored: string; denied: string; labels: Record<string, string>; errors: Messages };

const shown = ["id", "slug", "type", "subtype", "stock", "rating", "created_at", "deleted_at"];
const stamp = /^\d{4}-\d{2}-\d{2}T/;

export default function Pane ({ options, ports, route, feature }: FeatureProps<Options>) {
    const locale = useLocale();
    const port = usePort(ports.item, route);
    const remove = useWrite(ports.remove, route);
    const restore = useWrite(ports.restore, route);
    const item = port.status === "ready" ? row(port.value) : undefined;
    const amount = Number(field(item, "sale_price.amount") ?? field(item, "min_price.amount"));
    const currency = field(item, "sale_price.currency") ?? field(item, "min_price.currency");
    const facts = shown.flatMap(( key ) => {
        const value = field(item, key);
        const shown = value && stamp.test(value) ? formatDate(locale, value, "full") : value;

        return shown ? [{ key, label: options.labels[key] ?? key, value: shown }] : [];
    });
    const title = item ? field(item, "name") ?? options.missing : options.title;
    const id = field(item, "id") ?? "";
    const missing = port.status === "ready" && isFailure(port.error) && port.error.kind === "missing";
    const gone = Boolean(field(item, "deleted_at")) || (remove.status === "done" && restore.status !== "done") || (missing && restore.status !== "done");
    const busy = remove.status === "pending" || restore.status === "pending";
    const spoken = ( error: unknown ): string => Object.values(failureMessages(error, options.errors, options.failed))[0] ?? options.failed;
    const note = remove.status === "done" ? { text: options.removed, tone: "success" as const } : restore.status === "done" ? { text: options.restored, tone: "success" as const } : remove.status === "failed" ? { text: spoken(remove.error), tone: "danger" as const } : restore.status === "failed" ? { text: spoken(restore.error), tone: "danger" as const } : !remove.allowed && !restore.allowed && remove.ready && (ports.remove || ports.restore) ? { text: options.denied, tone: "muted" as const } : undefined;
    const edit = item && options.edit ? { href: localePath(locale, interpolate(options.edit, { id }), routing), label: options.editLabel } : undefined;
    const actions: DetailAction[] = [
        ...(item && ports.remove && remove.allowed && !gone ? [{ label: options.remove, icon: "trash", tone: "danger" as const, onPress: () => { restore.reset(); void remove.run({}); } }] : []),
        ...(item && ports.restore && restore.allowed && gone ? [{ label: options.restore, icon: "undo", tone: "ghost" as const, onPress: () => { remove.reset(); void restore.run({}); } }] : []),
    ];
    const pane = item ? <DetailActions edit={edit} actions={actions} busy={busy} note={note} /> : null;

    return (

        <Titled id={feature?.slug ?? "preview"} title={title} primary={feature?.heading ?? false}>

            {port.status === "ready" && port.error !== undefined ? <Note text={options.cached} /> : null}

            {port.status === "idle" ? <Note text={options.pick} /> : null}

            {item ? (

                <DetailCard item={{ name: field(item, "name") ?? "", image: field(item, "image"), type: field(item, "type"), price: amount > 0 && currency ? `${options.from} ${formatMoney(locale, amount, currency).text}` : undefined, facts }} actions={pane} />

            ) : <Status status={port.status === "ready" ? "idle" : port.status} loading={options.loading} failed={options.failed} offline={options.offline} error={port.status === "failed" ? port.error : undefined} />}

        </Titled>

    );
}
