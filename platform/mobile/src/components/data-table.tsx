import { field } from "@engine/spec";
import { formatDate, formatMoney } from "@engine/translate";
import Badge from "@/elements/badge";
import Table, { type Column as Cell, type Row } from "@/elements/table";
import Icon from "@/icons";
import SceneNote from "./scene";

export type Column = { key: string; label: string; kind?: "text" | "money" | "date" | "badge" | "boolean" | "number" | undefined; align?: "start" | "end" | undefined; width?: number | undefined };
type Props = { locale: string; columns: readonly Column[]; rows: readonly Record<string, unknown>[]; keyField: string; empty: string; selected?: string | undefined; onSelect?: (( key: string ) => void) | undefined };

const widths = { text: 200, money: 110, date: 120, badge: 110, boolean: 90, number: 80 } as const;

function cell ( locale: string, row: Record<string, unknown>, column: Column ) {

    const raw = field(row, column.key);

    if ( column.kind === "money" ) {

        const amount = Number(field(row, `${column.key}.amount`));
        const currency = field(row, `${column.key}.currency`);

        return amount > 0 && currency ? formatMoney(locale, amount, currency).text : "";

    }

    if ( column.kind === "date" ) return raw ? formatDate(locale, raw, "day") : "";
    if ( column.kind === "badge" ) return raw ? <Badge label={raw} /> : "";
    if ( column.kind === "boolean" ) return raw === "true" ? <Icon name="check" size="sm" label={column.label} /> : "";

    return raw ?? "";

}
export default function DataTable ({ locale, columns, rows, keyField, empty, selected, onSelect }: Props) {

    if ( !rows.length ) return <SceneNote scene="empty" text={empty} />;

    const cells: Cell[] = columns.map(( column ) => ({ key: column.key, label: column.label, align: column.align ?? (column.kind === "money" || column.kind === "number" ? "end" : "start"), width: column.width ?? widths[column.kind ?? "text"] }));
    const data: Row[] = rows.map(( row, index ) => ({
        key: field(row, keyField) ?? String(index),
        cells: Object.fromEntries(columns.map(( column ) => [column.key, cell(locale, row, column)])),
    }));

    return <Table columns={cells} rows={data} selected={selected} onSelect={onSelect} />;

}
