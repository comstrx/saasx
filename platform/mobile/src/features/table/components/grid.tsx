import { interpolate } from "engine/parse";
import { fillInput, rows } from "engine/spec";
import { useEffect, useRef } from "react";
import DataTable, { type Column } from "@/components/data-table";
import Note from "@/components/note";
import Pager from "@/components/pager";
import SortSelect from "@/components/sort-select";
import Status from "@/components/status";
import TableFrame from "@/components/table-frame";
import Titled from "@/components/titled";
import { usePort, useSignal, useSignals } from "@/hooks/use-client";
import { useLocale } from "@/hooks/use-locale";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = {
    title: string; empty: string; loading: string; failed: string; offline: string; cached: string;
    select: boolean; key: string; columns: Column[]; sorts: { value: string; label: string }[]; paging: boolean;
    labels: { sort: string; page: string; previous: string; next: string };
};

export default function Grid ({ options, ports, route, feature }: FeatureProps<Options>) {

    const locale = useLocale();
    const signals = useSignals();
    const port = usePort(ports.rows, route);
    const [selected, select] = useSignal<string>("selected");
    const [sort, setSort] = useSignal<string>("sort");
    const [page, setPage] = useSignal<number>("page");
    const input = ports.rows?.kind === "read" ? ports.rows.input : {};
    const filled = fillInput(input, { ...route, signals });
    const others = JSON.stringify(Object.entries(filled).filter(( [name] ) => name !== "page"));
    const seen = useRef(others);

    useEffect(() => {

        if ( seen.current === others ) return;

        seen.current = others;

        if ( options.paging ) setPage(1);

    }, [others, options.paging, setPage]);

    const pagination = port.status === "ready" ? port.meta : undefined;
    const current = pagination?.page ?? page ?? 1;
    const pages = pagination?.pages ?? 1;
    const toolbar = options.sorts.length ? <SortSelect label={options.labels.sort} value={sort ?? options.sorts[0]?.value ?? ""} choices={options.sorts} onChange={setSort} /> : null;
    const note = port.status === "ready" && port.error !== undefined ? <Note text={options.cached} /> : null;
    const pager = options.paging && port.status === "ready" ? <Pager page={current} pages={pages} label={interpolate(options.labels.page, { page: current, pages })} previous={options.labels.previous} next={options.labels.next} onPage={setPage} /> : null;

    return (

        <Titled id={feature?.slug ?? "table"} title={options.title} primary={feature?.heading ?? false}>

            <TableFrame toolbar={toolbar} note={note} pager={pager}>

                {port.status === "ready"
                    ? <DataTable locale={locale} columns={options.columns} rows={rows(port.value)} keyField={options.key} empty={options.empty} selected={selected} onSelect={options.select ? select : undefined} />
                    : <Status status={port.status} loading={options.loading} failed={options.failed} offline={options.offline} error={port.status === "failed" ? port.error : undefined} />}

            </TableFrame>

        </Titled>

    );

}
